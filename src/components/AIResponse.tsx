import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Question } from "@/types/quiz";
import { Loader2, Eye, Wand2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAnswer } from "@/services/answers";
import { toast } from "sonner";

interface AIResponseProps {
  isLoading: boolean;
  response: string;
  onResponseChange: (response: string) => void;
  question?: Question;
  branchContext?: string;
  onAILookup?: (value: string, buttonId?: string, applicationId?: string, forceRefresh?: boolean) => void;
  inputValue?: string;
}

const AIResponse = ({
  isLoading,
  response,
  onResponseChange,
  question,
  branchContext,
  onAILookup,
  inputValue,
}: AIResponseProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedButtonId, setSelectedButtonId] = useState<string | null>(null);
  const [storedAnalysis, setStoredAnalysis] = useState<any>(null);

  // Get application ID once when component mounts
  const applicationId = localStorage.getItem('application_id');

  useEffect(() => {
    const fetchExistingAnswer = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error("User not authenticated");
          return;
        }

        if (!question) {
          console.error("Missing required question parameter");
          return;
        }

        if (!applicationId) {
          console.error("No application ID found");
          return;
        }

        const existingAnswer = await getAnswer(
          user.id,
          question.id,
          branchContext,
          applicationId
        );
        console.log("Existing answer fetched:", existingAnswer);

        setStoredAnalysis(existingAnswer?.aiAnalysis || null);
        onResponseChange(existingAnswer?.aiAnalysis?.analysis || "");
      } catch (error) {
        console.error("Error fetching existing answer:", error);
      }
    };

    fetchExistingAnswer();
  }, [question, branchContext, onResponseChange, applicationId]);

  const currentResponse =
    selectedButtonId && storedAnalysis?.buttonResponses?.[selectedButtonId]
      ? storedAnalysis.buttonResponses[selectedButtonId]
      : storedAnalysis?.analysis || response;

  const validResponse = typeof currentResponse === "string" ? currentResponse : "";

  return (
    <Card className="relative p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">AI Analysis</h3>
        <div className="flex items-center gap-2">
          {selectedButtonId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!inputValue) {
                  toast.error("Please enter a value first");
                  return;
                }
                if (!selectedButtonId) {
                  toast.error("Please select an analysis type first");
                  return;
                }
                // Pass true for forceRefresh when refresh button is clicked
                onAILookup?.(inputValue, selectedButtonId, applicationId, true);
              }}
              disabled={isLoading}
              className="h-8 px-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          {isLoading && (
            <div className="flex items-center text-sm text-gray-500">
              Generating response...
            </div>
            )}
          </div>
        </div>

      {isEditing ? (
        <>
          <Textarea
            value={validResponse}
            onChange={(e) => onResponseChange(e.target.value)}
            className="min-h-[150px] transition-opacity duration-200"
            style={{ opacity: isLoading ? 0.5 : 1 }}
            placeholder="AI analysis will appear here..."
          />
          <Button onClick={() => setIsEditing(false)} className="mt-2">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </>
      ) : (
        <div>
          {question?.aiLookup?.buttons?.length > 0 && (
            <div className="flex gap-2 mt-4 mb-4 border-t pt-4">
              <div className="flex flex-wrap gap-2">
                {question.aiLookup.buttons
                  .filter((button) => button.enabled)
                  .map((button) => (
                    <Button
                      key={button.id}
                      variant={selectedButtonId === button.id ? "default" : "outline"}
                      onClick={() => {
                        //if (selectedButtonId === button.id) {
                        //  setSelectedButtonId(null); // Deselect if already selected
                        //} else {
                        
                          setSelectedButtonId(button.id);
                            onAILookup?.(inputValue || "", button.id, applicationId, false);
                       // }
                      }}
                      className="shrink-0 whitespace-nowrap"
                      disabled={isLoading || !inputValue}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      {button.label}
                    </Button>
                  ))}
              </div>
            </div>
          )}
          <div className="p-4 bg-gray-50 border rounded-md">
            {validResponse ? (
              <ReactMarkdown>{validResponse}</ReactMarkdown>
            ) : (
              <div className="text-gray-500 text-sm">
                {selectedButtonId
                  ? "Click the button again to generate analysis"
                  : "Select an analysis type above"}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export { AIResponse };