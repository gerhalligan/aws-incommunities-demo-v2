import { Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Question } from "@/types/quiz";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { FileUploadConfig } from "./FileUploadConfig";
import { DependencyEditor } from "./DependencyEditor";
import { LogicEditor } from "./LogicEditor";
import { RepeaterConfig } from "./RepeaterConfig";
import { AIPromptEditor } from "./AIPromptEditor";
import { useState } from "react";

interface AdminOptionsProps {
  question: Question;
  questions: Question[];
  newOption: string;
  onNewOptionChange: (value: string) => void;
  onAddOption: () => void;
  onUpdateQuestion: (updates: Partial<Question>) => void;
}

export const AdminOptions = ({
  question,
  questions,
  newOption,
  onNewOptionChange,
  onAddOption,
  onUpdateQuestion
}: AdminOptionsProps) => {
  const [showDependencies, setShowDependencies] = useState(false);
  const [showLogic, setShowLogic] = useState(false);

  if (!question) {
    return null;
  }

  return (
    <>
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <Label>Question Type</Label>
          <Select
            value={question.type}
            onValueChange={(value: 'multiple-choice' | 'input') => 
              onUpdateQuestion({ 
                type: value,
                ...(value === 'input' && !question.inputMetadata && {
                  inputMetadata: {
                    inputType: 'text',
                    placeholder: 'Type your answer here...',
                    validation: {
                      required: true
                    }
                  }
                })
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
              <SelectItem value="input">Input Field</SelectItem>
              <SelectItem value="repeater">Repeater</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {question.type === 'input' && (
          <div className="space-y-2">
            <Label>Input Type</Label>
            <Select
              value={question.inputMetadata?.inputType || 'text'}
              onValueChange={(value: 'text' | 'number') =>
                onUpdateQuestion({
                  inputMetadata: {
                    ...question.inputMetadata,
                    inputType: value,
                  }
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select input type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {question.type === 'repeater' && (
          <RepeaterConfig
            config={question.repeaterConfig || { fields: [] }}
            onUpdate={(config) => onUpdateQuestion({ repeaterConfig: config })}
          />
        )}

        <FileUploadConfig
          question={question}
          onUpdate={onUpdateQuestion}
        />

        <AIPromptEditor
          question={question}
          onUpdate={onUpdateQuestion}
        />

        <div className="flex gap-2 mt-6">
          {questions.some(q => q.id < question.id) && (
            <Button
              variant={showDependencies ? "default" : "outline"}
              onClick={() => setShowDependencies(!showDependencies)}
            >
              {showDependencies ? "Hide Dependencies" : "Show Dependencies"}
            </Button>
          )}
          <Button
            variant={showLogic ? "default" : "outline"}
            onClick={() => setShowLogic(!showLogic)}
          >
            {showLogic ? "Hide Logic" : "Show Logic"}
          </Button>
        </div>


        {showDependencies && (
          <DependencyEditor
            question={question}
            questions={questions}
            onUpdate={onUpdateQuestion}
            className="mt-6"
          />
        )}

        {showLogic && (
          <LogicEditor
            question={question}
            questions={questions}
            onUpdate={onUpdateQuestion}
            className="mt-6"
          />
        )}
      </div>

      {question.type === 'multiple-choice' && (
        <div className="flex gap-2 mb-4 pt-6" id="add-option-container">
          <Input
            type="text"
            value={newOption}
            onChange={(e) => onNewOptionChange(e.target.value)}
            placeholder="Type new option..."
            className="flex-1"
            id="new-option-input"
          />
          <Button
            onClick={onAddOption}
            className="flex items-center gap-2"
            id="add-option-button"
          >
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      )}
    </>
  );
};