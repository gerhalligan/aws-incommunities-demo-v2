import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

// In NextButton.tsx
interface NextButtonProps {
  onClick: () => void;
  onBack?: () => void;
  showBack?: boolean;
  isLastBranchQuestion?: boolean;
  isBranchableRepeater?: boolean;
  setAiAnalysis?: (value: string) => void;
  handleUpdateQuestion?: (updates: Partial<Question>) => void;
}

// In NextButton.tsx, modify the outer div's className to use justify-end when there's no back button

export const NextButton = ({ onClick, onBack, showBack = false, isLastBranchQuestion = false, isBranchableRepeater = false }: NextButtonProps) => {
  return (
    <div 
      className={`flex ${showBack ? 'justify-between' : 'justify-end'} mt-6 animate-fade-in`} 
      id="next-button-container"
    >
      {showBack && (
        <Button
          onClick={onBack}
          className="group bg-secondary hover:bg-secondary/90 text-white px-6 py-2 rounded-lg transition-all duration-300"
          id="back-button"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Button>
      )}
      <Button
        onClick={onClick}
        className="group bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-all duration-300"
        id="next-button"
      >
        {isLastBranchQuestion ? (
          <>
            Save and Return
            <ArrowLeft className="ml-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </>
       ) : isBranchableRepeater ? (
         <>
           Save and View Report
           <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
         </>
        ) : (
          <>
            Next
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </div>
  );
};