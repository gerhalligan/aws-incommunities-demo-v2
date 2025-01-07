import { Progress } from "@/components/ui/progress";

// In ProgressBar.tsx
// In ProgressBar.tsx
interface ProgressBarProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  currentBranch?: RepeaterBranch | null;
  questions: Question[];
  currentQuestion?: Question;
}

export const ProgressBar = ({ currentQuestionIndex, totalQuestions, currentBranch, questions, currentQuestion }: ProgressBarProps) => {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const entryNumber = currentBranch?.entryIndex || null;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
        </div>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
