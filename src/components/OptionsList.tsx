import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Option {
  id: string;
  text: string;
  nextQuestionId?: number;
}

interface OptionsListProps {
  options: Option[];
  selectedOption: Option | null;
  onOptionSelect: (option: Option) => void;
  onRemoveOption: (option: Option) => void;
  showRemoveButton?: boolean;
}

export const OptionsList = ({ 
  options, 
  selectedOption, 
  onOptionSelect, 
  onRemoveOption,
  showRemoveButton = false 
}: OptionsListProps) => {
  return (
    <div 
      className="min-h-[300px] max-h-[calc(100vh-400px)] overflow-y-auto overflow-x-hidden custom-scrollbar px-4 py-6" 
      data-component="options-container"
    >
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2 group">
            <div className="w-full flex items-center">
              <button
                onClick={() => onOptionSelect(option)}
                className={cn(
                  "flex-1 w-full text-left px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02]",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  selectedOption === null
                    ? "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    : selectedOption.id === option.id
                    ? "bg-primary text-primary-foreground scale-[1.02]"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100",
                  "animate-fade-in"
                )}
                data-option-id={option.id}
              >
                {option.text}
              </button>
              {showRemoveButton && (
                <button
                  onClick={() => onRemoveOption(option)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full hover:bg-red-100 ml-2"
                  data-remove-option-id={option.id}
                  aria-label={`Remove option ${option.text}`}
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};