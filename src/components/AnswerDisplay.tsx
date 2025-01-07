import { FileMetadata } from "@/types/files";
import { Question } from "@/types/quiz";
import ReactMarkdown from "react-markdown";
import "github-markdown-css/github-markdown.css";

interface AIAnalysisProps {
  markdown: string;
}

interface AnswerDisplayProps {
  answer: any;
  question?: Question; // So we can access question.repeaterConfig if needed
}

export function AIAnalysis({ markdown }: AIAnalysisProps) {
  return (
    <div className="text-sm text-gray-700">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

export const AnswerDisplay = ({ answer, question }: AnswerDisplayProps) => {
  if (!answer) return null;

  /***********************************
   * 1) Handle file upload answers
   ***********************************/
  if (answer.files) {
    return (
      <div className="space-y-2">
        {answer.files.map((file: FileMetadata, index: number) => (
          <div key={index} className="bg-gray-50 p-3 rounded-md">
            <p className="font-medium">
              File {index + 1}: {file.name}
            </p>
            {file.formData && Object.entries(file.formData).length > 0 && (
              <div className="mt-2 pl-4 border-l-2 border-gray-200">
                {Object.entries(file.formData).map(([key, value]) => (
                  <p key={key} className="text-sm text-gray-600">
                    <span className="font-medium">{key}:</span> {value}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  /********************************************************************
   * 2) Handle repeater answers stored as JSON — possibly in answer.value
   ********************************************************************/
  // The "rawAnswer" might be in `answer` if it's a string, or in `answer.value`
  let rawAnswer = "";
  if (typeof answer === "string") {
    rawAnswer = answer;
  } else if (typeof answer?.value === "string") {
    rawAnswer = answer.value;
  }

  // We'll store the main rendered output in a variable (renderedAnswer).
  let renderedAnswer: JSX.Element | null = null;

  // If rawAnswer looks like JSON, parse it and handle the repeater
  if (rawAnswer.startsWith("{") && rawAnswer.endsWith("}")) {
    try {
      const parsedAnswer = JSON.parse(rawAnswer);
      // We expect an object like: { entries: [...] }
      if (parsedAnswer.entries) {
        // Pull the field definitions from the question (repeaterConfig)
        const fields = question?.repeaterConfig?.fields || [];

        renderedAnswer = (
          <div className="space-y-2">
            {parsedAnswer.entries.map((entry: any, index: number) => {
              const totalEntries = parsedAnswer.entries.length;
              return (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  {/* Only show "Entry X" if there’s more than one entry */}
                  {totalEntries > 1 && (
                    <p className="font-medium">Entry {index + 1}</p>
                  )}

                  <div className="mt-2 pl-4 border-l-2 border-gray-200">
                    {Object.entries(entry.values).map(([fieldId, value]) => {
                      // Match the field by ID from question.repeaterConfig
                      const field = fields.find((f) => f.id === fieldId);
                      if (!field?.label) return null;

                      return (
                        <p key={fieldId} className="text-sm text-gray-600">
                          <span className="font-medium">{field.label}:</span> {value}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      } else {
        // If no .entries, fall back to rawAnswer text
        renderedAnswer = (
          <div className="bg-gray-50 p-3 rounded-md">{rawAnswer}</div>
        );
      }
    } catch (e) {
      console.error("Error parsing repeater answer:", e);
      // If JSON parsing fails, show the raw string
      renderedAnswer = (
        <div className="bg-gray-50 p-3 rounded-md">{rawAnswer}</div>
      );
    }
  } else {
    // 3) Otherwise, treat it as plain text or multiple-choice
    renderedAnswer = (
      <div className="bg-gray-50 p-3 rounded-md">
        {typeof answer === "string"
          ? answer
          : // For multiple choice, answer might be { text: "...", value: "..." }
            answer.text || answer.value}
      </div>
    );
  }

  /*************************************************************
   * 4) If there's an aiAnalysis, show it below the main answer
   *************************************************************/
  if (answer.aiAnalysis) {
    return (
      <div className="space-y-4">
        {/* Render the main part of the answer first */}
        {renderedAnswer}

        {/* Then show the AI analysis in a separate section */}
        <div className="bg-purple-50 p-3 rounded-md">
          <h4 className="font-medium text-purple-800 mb-1">
            AI Analysis
          </h4>
          <div className="text-sm text-gray-700 markdown-body">
            <AIAnalysis markdown={answer.aiAnalysis} />
          </div>
        </div>
      </div>
    );
  }

  /************************************************************
   * 5) If no aiAnalysis, just return the main rendered answer
   ************************************************************/
  return renderedAnswer;
};
