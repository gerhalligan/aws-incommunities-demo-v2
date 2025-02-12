import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAnswersStore } from "../store/answersStore";
import ReactMarkdown from 'react-markdown';
import { supabase } from "@/integrations/supabase/client";

<lov-add-dependency>react-markdown@latest</lov-add-dependency>

// Button text mapping from questions data
const buttonTextMap = {
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

  useEffect(() => {
    const loadAnswers = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error("User not authenticated");
          return;
        }
  
        if (!currentApplicationId) {
          console.error("No application ID found");
          return;
        }
  
        const { data: answers, error } = await supabase
          .from('question_answers')
          .select('*')
          .eq('user_id', user.id)
          .eq('application_id', currentApplicationId)
          .order('created_at', { ascending: true });
  
        if (error) {
          console.error("Error fetching answers:", error);
          return;
        }
  
        console.log("Loaded answers:", answers);
        setAnswers(answers || []);
      } catch (error) {
        console.error('Error loading answers:', error);
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

  const renderBranchContent = (branchEntryId: string | null) => {
    const branchAnswers = getAnswersByBranchEntryId(branchEntryId);
    const locationAnswer = branchAnswers.find(a => a.question_id === 6);
    const growthAnswer = branchAnswers.find(a => a.question_id === 17);
    const authoritiesAnswer = branchAnswers.find(a => a.question_id === 8);

    // Parse growth data from the answer
    const growthData = (() => {
      if (!growthAnswer) return [];
      try {
        const parsed = JSON.parse(growthAnswer.answer.value);
        const entry = parsed.entries[0];
        const yearMapping = {
          '34538b46-fd30-4398-9dbf-5e3fbb68ce78': 'Year 1',
          'c3d1f976-1435-4268-9277-170eae1a560f': 'Year 2',
          'ac418ddb-4a2e-4e42-b690-9f92ef9ba2e3': 'Year 3',
          '47c9946e-c744-4781-8bbb-c97ee774f99e': 'Year 4',
          '2bdebd73-d0db-4585-a03c-9b272e84b72c': 'Year 5'
        };
        
        return Object.entries(yearMapping)
          .filter(([key]) => entry.values[key])
          .map(([key, yearLabel]) => ({
            year: yearLabel,
            capacity: Number(entry.values[key])
          }));
      } catch (e) {
        console.error('Error parsing growth data:', e);
        return [];
      }
    })();

    const renderAIAnalysis = (locationAnswer: any) => {
      if (!locationAnswer?.answer.aiAnalysis?.buttonResponses) return null;

      return (
        <Accordion type="single" collapsible className="space-y-4">
          {Object.entries(buttonTextMap).map(([buttonId, buttonText]) => {
            const response = locationAnswer.answer.aiAnalysis?.buttonResponses[buttonId];
            if (!response) return null;

            return (
              <AccordionItem key={buttonId} value={buttonId} className="border rounded-lg px-4">
                <AccordionTrigger className="py-4">
                  <div className="flex flex-col items-start">
                    <h3 className="text-lg font-semibold">{buttonText}</h3>
                    <p className="text-sm text-gray-600 font-normal text-left">
                      {response.split('\n')[0].slice(0, 150) + '...'}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm max-w-none pb-4 dark:prose-invert">
                    <ReactMarkdown>{response}</ReactMarkdown>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      );
    };

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Location Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Primary Location</h3>
                  <p className="text-lg">{locationAnswer?.answer.value || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Location Type</h3>
                  <p className="text-lg">{branchAnswers.find(a => a.question_id === 7)?.answer.value || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Growth Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Capacity Growth Projection</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="capacity" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI Analysis */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">AI Analysis</h2>
          {locationAnswer && renderAIAnalysis(locationAnswer)}
        </Card>

        {/* Authorities */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Authorities and Jurisdiction</h2>
          <div className="space-y-4">
            {(() => {
              try {
                const authorities = JSON.parse(getAnswerByQuestionId(9)?.answer.value || '{"entries": []}').entries;
                return (
                  <Accordion type="single" collapsible className="space-y-4">
                    {authorities.map((authority: any) => (
                      <AccordionItem 
                        key={authority.id} 
                        value={authority.id}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="py-4">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col items-start">
                              <h3 className="font-semibold">{authority.values['220132e5-55eb-47d2-a9a3-fadfdb33bab5']}</h3>
                              <p className="text-sm text-gray-600">{authority.values['ec8641c1-d79b-4894-9d86-a1ca97de0e53']} Authority</p>
                            </div>
                            <Badge variant={authority.id === '891331d6-5d70-4034-8725-959606d165e9' ? 'default' : 'outline'}>
                              {authority.id === '891331d6-5d70-4034-8725-959606d165e9' ? 'Primary AHJ' : 'Secondary AHJ'}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {authoritiesAnswer?.answer.aiAnalysis && (
                            <div className="prose prose-sm max-w-none pb-4 dark:prose-invert">
                              <ReactMarkdown>
                                {authoritiesAnswer.answer.aiAnalysis.analysis}
                              </ReactMarkdown>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                );
              } catch (e) {
                console.error('Error parsing authorities:', e);
                return null;
              }
            })()}
          </div>
        </Card>
      </div>
    );
  };

  const branchIds = getBranchEntryIds();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AWS Infrastructure Report</h1>
        <p className="text-lg text-gray-600">Comprehensive Analysis of Regional Development</p>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Region</h3>
          <p className="text-2xl font-bold text-blue-600">{getAnswerByQuestionId(1)?.answer.value || 'N/A'}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Cluster</h3>
          <p className="text-2xl font-bold text-blue-600">{getAnswerByQuestionId(2)?.answer.value || 'N/A'}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Infrastructure Type</h3>
          <p className="text-2xl font-bold text-blue-600">{getAnswerByQuestionId(3)?.answer.value || 'N/A'}</p>
        </Card>
      </div>

      {/* Priority Level */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Priority Level</h2>
        <Badge variant="secondary" className="text-lg text-white">
          {getAnswerByQuestionId(4)?.answer.value || 'N/A'}
        </Badge>
      </Card>

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
            {renderBranchContent(branchId)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ReportDashboard;