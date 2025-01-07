import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader2, Edit3, Eye, Wand2 } from "lucide-react";

interface AIResponseProps {
  isLoading: boolean;
  response: string;
  onResponseChange: (response: string) => void;
  storedAnalysis?: string; // Add this prop
  question?: Question;
  onAILookup?: (value: string, buttonId?: string) => void;
  inputValue?: string;
  buttonResponses?: Record<string, string>;
}

export const AIResponse = ({ 
  isLoading, 
  response, 
  onResponseChange, 
  storedAnalysis,
  question,
  onAILookup,
  inputValue,
  buttonResponses = {} 
}: AIResponseProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedButtonId, setSelectedButtonId] = useState<string | null>(() => {
    // If we have a stored analysis, find which button it belongs to
    if (storedAnalysis && question?.aiLookup?.buttons) {
      const firstButton = question.aiLookup.buttons.find(b => b.enabled);
      if (firstButton && buttonResponses[firstButton.id] === storedAnalysis) {
        return firstButton.id;
      }
    }
    return null;
  });

  // <-- ADDED useEffect HERE
  useEffect(() => {
    // Whenever question changes, reset local UI states:
    setIsEditing(false);
    setSelectedButtonId(null);

    // Reset the displayed text to storedAnalysis or empty
    // so the Textarea won't show old data from the previous question.
    onResponseChange(storedAnalysis || "");
  }, [question?.id]); // Trigger on question change

  // Decide which text to display
  const currentResponse = selectedButtonId 
    ? buttonResponses?.[selectedButtonId] || response
    : storedAnalysis || response;

  // Just for debugging
  console.log('AIResponse props:', {
    response,
    storedAnalysis,
    buttonResponses,
    selectedButtonId,
    currentResponse
  });

  return (
    <Card className="relative p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">AI Analysis</h3>
        {isLoading && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating response...
          </div>
        )}
      </div>
      
      {isEditing ? (
        <>
          <Textarea
            value={currentResponse}
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
              {question.aiLookup.buttons
                .filter(button => button.enabled)
                .map((button) => (
                  <Button 
                    key={button.id}
                    variant={selectedButtonId === button.id ? "default" : "outline"}
                    onClick={() => {
                      if (selectedButtonId === button.id) {
                        setSelectedButtonId(null);  // Deselect if already selected
                      } else {
                        setSelectedButtonId(button.id);
                        // Only call AI if we don't have a response for this button yet
                        if (!buttonResponses[button.id]) {
                          onAILookup?.(inputValue || '', button.id);
                        }
                      }
                    }}
                    className="shrink-0"
                    disabled={isLoading || !inputValue}
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {button.label}
                  </Button>
                ))
              }
            </div>
          )}
          <div className="p-4 bg-gray-50 border rounded-md">
            <ReactMarkdown>{currentResponse}</ReactMarkdown>
          </div>
        </div>
      )}
    </Card>
  );
};
