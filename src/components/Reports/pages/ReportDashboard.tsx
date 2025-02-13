import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnswersStore } from "../store/answersStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RTFDocument } from "../utils/rtfGenerator";
import { KeyInformation } from "../components/KeyInformation";
import { PriorityLevel } from "../components/PriorityLevel";
import { BranchContent } from "../components/BranchContent";
import { ExportButton } from "../components/ExportButton";
import { styles } from "../utils/rtfStyles";

// Button text mapping from questions data
export const buttonTextMap = {
  "69fb3286-4a26-487c-8c9a-f66871a8289d": "Strategic Plan",
  "625041ed-58a2-407e-acc6-d6fad8f2694c": "Top 5 Stakeholders",
  "74babb37-f296-4c36-b066-4f618cf52966": "Top 5 Local Newspapers",
  "dd92dc1d-3816-4732-85d2-52000bbc61f9": "Area Info",
  "e3186dcb-72ba-40e5-88b1-bb17723c682f": "Median Household Income",
  "fc724685-80e9-43b3-b9ea-46bcc74faeeb": "Local Schools Info",
  "053cac4d-dae3-491a-ba46-2e3e64e2ce2e": "Top 5 Local Festivals",
  "54c1ca89-8b17-4af2-92e9-2ecaf8e8100f": "Planning Objections in Last 5 Years"
};

const ReportDashboard = () => {
  const { answers, setAnswers, getAnswerByQuestionId, getAnswersByBranchEntryId, getBranchEntryIds, getBranchName } = useAnswersStore();
  const [activeTab, setActiveTab] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentApplicationId] = React.useState(localStorage.getItem('application_id'));
  const [isExporting, setIsExporting] = React.useState(false);

  useEffect(() => {
    const loadAnswers = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !currentApplicationId) {
          console.error("Missing user or application ID");
          return;
        }

        const { data: answers, error } = await supabase
          .from('question_answers')
          .select('*')
          .eq('user_id', user.id)
          .eq('application_id', currentApplicationId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setAnswers(answers || []);
      } catch (error) {
        console.error('Error loading answers:', error);
        toast.error("Failed to load report data");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnswers();
  }, [setAnswers, currentApplicationId]);

  useEffect(() => {
    if (!isLoading && answers.length > 0) {
      const branchIds = getBranchEntryIds();
      const firstBranchId = branchIds[0];
      if (firstBranchId && !activeTab) {
        setActiveTab(firstBranchId);
      }
    }
  }, [isLoading, answers, getBranchEntryIds, activeTab]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const doc = new RTFDocument();
      
      // Add title with formatting
      doc.addParagraph('AWS InCommunities Infrastructure Report', {
        fontSize: 32,
        bold: true,
        color: '#2F6CF7',
        align: 'center',
        spaceBefore: 200,
        spaceAfter: 200
      });
      
      // Add generation date
      doc.addParagraph(`Generated: ${new Date().toLocaleString()}`, {
        fontSize: 20,
        align: 'center',
        spaceBefore: 10,
        spaceAfter: 400
      });
      
      // Add key information section
      await addKeyInformation(doc);
      
      // Add branch information section
      await addBranchInformation(doc);
      
      // Generate RTF content and download
      const blob = new Blob([doc.toString()], { type: 'application/rtf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aws-incommunities-report-${new Date().toISOString().split('T')[0]}.rtf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Report exported successfully");
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  const addKeyInformation = async (doc: RTFDocument) => {
    doc.addParagraph('Key Information', {
      fontSize: 28,
      bold: true,
      color: '#2F6CF7',
      spaceBefore: 200,
      spaceAfter: 200
    });
    
    const keyInfo = [
      { label: 'Region', value: getAnswerByQuestionId(1)?.answer.value },
      { label: 'Cluster', value: getAnswerByQuestionId(2)?.answer.value },
      { label: 'Infrastructure Type', value: getAnswerByQuestionId(3)?.answer.value },
      { label: 'Priority Level', value: getAnswerByQuestionId(4)?.answer.value }
    ];
    
    keyInfo.forEach(({ label, value }) => {
      doc.addParagraph(`${label}: ${value || 'N/A'}`, {
        fontSize: 20,
        spaceBefore: 100,
        spaceAfter: 100,
        firstLineIndent: 200
      });
    });
  };

  const addBranchInformation = async (doc: RTFDocument) => {
    const branchIds = getBranchEntryIds();
    
    for (const branchId of branchIds) {
      if (!branchId) continue;
      
      doc.addParagraph(getBranchName(branchId), {
        fontSize: 24,
        bold: true,
        color: '#1E4CAD',
        spaceBefore: 400,
        spaceAfter: 200
      });
      
      const branchAnswers = getAnswersByBranchEntryId(branchId);
      await addBranchContent(doc, branchAnswers);
    }
  };

  const addBranchContent = async (doc: RTFDocument, branchAnswers: any[]) => {
    // Add location details
    const locationAnswer = branchAnswers.find(a => a.question_id === 6);
    if (locationAnswer) {
      doc.addParagraph('Location Details', {
        fontSize: 24,
        bold: true,
        spaceBefore: 300,
        spaceAfter: 200
      });

      doc.addParagraph(`Location: ${locationAnswer.answer.value || 'N/A'}`, {
        fontSize: 20,
        spaceBefore: 100,
        spaceAfter: 100,
        firstLineIndent: 200
      });
      
      // Add AI analysis if available
      if (locationAnswer.answer.aiAnalysis?.buttonResponses) {
        Object.entries(buttonTextMap).forEach(([buttonId, buttonText]) => {
          const response = locationAnswer.answer.aiAnalysis.buttonResponses[buttonId];
          if (response) {
            doc.addParagraph(buttonText, {
              fontSize: 20,
              bold: true,
              color: '#2F6CF7',
              spaceBefore: 300,
              spaceAfter: 100
            });

            doc.addParagraph(response, {
              fontSize: 20,
              spaceBefore: 100,
              spaceAfter: 200,
              firstLineIndent: 200
            });
          }
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const branchIds = getBranchEntryIds();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AWS Infrastructure Report</h1>
        <p className="text-lg text-gray-600">Comprehensive Analysis of Regional Development</p>
        <ExportButton onClick={handleExport} isExporting={isExporting} />
      </div>

      {/* Key Information */}
      <KeyInformation
        region={getAnswerByQuestionId(1)?.answer.value}
        cluster={getAnswerByQuestionId(2)?.answer.value}
        infrastructureType={getAnswerByQuestionId(3)?.answer.value}
      />

      {/* Priority Level */}
      <PriorityLevel priority={getAnswerByQuestionId(4)?.answer.value} />

      {/* Branches Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {branchIds.map((branchId) => branchId && (
            <TabsTrigger key={branchId} value={branchId}>
              {getBranchName(branchId)}
            </TabsTrigger>
          ))}
        </TabsList>

        {branchIds.map((branchId) => branchId && (
          <TabsContent key={branchId} value={branchId}>
            <BranchContent
              branchAnswers={getAnswersByBranchEntryId(branchId)}
              buttonTextMap={buttonTextMap}
              getAnswerByQuestionId={getAnswerByQuestionId}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ReportDashboard;