import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Option {
  id: string;
  text: string;
  nextQuestionId?: number;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
  defaultNextQuestionId?: number;
}

interface LogicEditorProps {
  question: Question;
  questions: Question[];
  onUpdate: (updates: Partial<Question>) => void;
  className?: string;
}

export const LogicEditor = ({ question, questions, onUpdate, className = "" }: LogicEditorProps) => {
  const otherQuestions = questions.filter(q => q.id !== question.id);

  const handleDefaultNextChange = (value: string) => {
    onUpdate({
      defaultNextQuestionId: value === "end" ? undefined : Number(value)
    });
  };

  const handleOptionNextChange = (optionId: string, value: string) => {
    const updatedOptions = question.options.map(opt =>
      opt.id === optionId
        ? { ...opt, nextQuestionId: value === "end" ? undefined : Number(value) }
        : opt
    );
    onUpdate({ options: updatedOptions });
  };

  return (
    <div className={`space-y-4 p-4 bg-gray-50 rounded-lg ${className}`}>
      <div className="space-y-2">
        <Label>Default Next Question</Label>
        <Select
          value={question.defaultNextQuestionId?.toString() || "end"}
          onValueChange={handleDefaultNextChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select next question" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="end">End Quiz</SelectItem>
            {otherQuestions.map((q) => (
              <SelectItem key={q.id} value={q.id.toString()}>
                {q.question}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Option-Specific Logic</Label>
        <div className="space-y-2">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <span className="min-w-[120px] text-sm font-medium">{option.text}:</span>
              <Select
                value={option.nextQuestionId?.toString() || "default"}
                onValueChange={(value) => handleOptionNextChange(option.id, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select next question" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Use Default</SelectItem>
                  <SelectItem value="end">End Quiz</SelectItem>
                  {otherQuestions.map((q) => (
                    <SelectItem key={q.id} value={q.id.toString()}>
                      {q.question}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};