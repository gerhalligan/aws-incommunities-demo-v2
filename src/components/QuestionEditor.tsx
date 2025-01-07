import { useState } from "react";
import { Pencil, Check } from "lucide-react";
import { Input } from "./ui/input";
import { Question } from "@/types/quiz";

interface QuestionEditorProps {
  question: Question;
  questions: Question[];
  onUpdate: (updates: Partial<Question>) => void;
}

export const QuestionEditor = ({ question, questions, onUpdate }: QuestionEditorProps) => {
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question?.question);

  const handleQuestionEdit = () => {
    if (isEditingQuestion) {
      onUpdate({ question: editedQuestion });
      setIsEditingQuestion(false);
    } else {
      setEditedQuestion(question.question);
      setIsEditingQuestion(true);
    }
  };

if (!question) {
  return null;
}

  return (
    <div className="flex items-center gap-2 w-full">
      {isEditingQuestion ? (
        <Input
          value={editedQuestion}
          onChange={(e) => setEditedQuestion(e.target.value)}
          className="text-2xl font-semibold text-gray-800 flex-1"
          autoFocus
          onBlur={handleQuestionEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleQuestionEdit();
            }
          }}
        />
      ) : (
        <h2 className="text-2xl font-semibold text-gray-800 flex-1" id="question-text">
          {question.question}
        </h2>
      )}
      <button
        onClick={handleQuestionEdit}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
      >
        {isEditingQuestion ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Pencil className="w-4 h-4 text-gray-500" />
        )}
      </button>
    </div>
  );
};