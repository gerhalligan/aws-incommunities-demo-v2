import { Question } from "@/types/quiz";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface InputQuestionProps {
  question: Question;
  onInputSubmit: (value: string) => void;
  initialValue?: string;
  onAILookup?: (value: string) => void;
}

export const InputQuestion = ({ question, onInputSubmit, initialValue = "", onAILookup }: InputQuestionProps) => {
  const [value, setValue] = useState(initialValue);
  const metadata = question.inputMetadata;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onInputSubmit(e.target.value);
  };

  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  return (
    <div className="min-h-[80px] px-4 py-6 pl-1 pr-1" >
      <div className="flex gap-2">
        <Input
          type={metadata?.inputType || "text"}
          placeholder={metadata?.placeholder || "Type your answer here..."}
          value={value}
          onChange={handleInputChange}
          min={metadata?.validation?.min}
          max={metadata?.validation?.max}
          minLength={metadata?.validation?.minLength}
          maxLength={metadata?.validation?.maxLength}
          pattern={metadata?.validation?.pattern}
          required={metadata?.validation?.required}
          className="w-full p-3 text-lg"
        />
        {false && question.aiLookup?.enabled && (
          <Button 
            variant="outline"
            onClick={() => onAILookup?.(value)}
            className="shrink-0"
          >
            <Search className="w-4 h-4 mr-2" />
            AI Lookup
          </Button>
        )}
      </div>
    </div>
  );
};
