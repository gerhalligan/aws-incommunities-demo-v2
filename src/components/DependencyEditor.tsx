import { useState } from "react";
import { Question } from "@/types/quiz";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Save } from "lucide-react";

interface DependencyEditorProps {
  question: Question;
  questions: Question[];
  onUpdate: (updates: Partial<Question>) => void;
  className?: string;
}

export const DependencyEditor = ({ question, questions, onUpdate, className = "" }: DependencyEditorProps) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const previousQuestions = questions.filter(q => q.id < question.id);

  const handleAddDependency = (dependentQuestionId: number) => {
    const updatedDependencies = [
      ...(question.dependsOn || []),
      { questionId: dependentQuestionId, options: [] }
    ];
    setHasUnsavedChanges(true);
    onUpdate({ dependsOn: updatedDependencies });
  };

  const handleRemoveDependency = (questionId: number) => {
    const updatedDependencies = question.dependsOn?.filter(dep => dep.questionId !== questionId) || [];
    setHasUnsavedChanges(true);
    onUpdate({ dependsOn: updatedDependencies });
  };

  const handleOptionDependencyChange = (questionId: number, optionId: string, isSelected: boolean) => {
    const updatedDependencies = question.dependsOn?.map(dep => {
      if (dep.questionId === questionId) {
        return {
          ...dep,
          options: isSelected 
            ? [...dep.options, optionId]
            : dep.options.filter(id => id !== optionId)
        };
      }
      return dep;
    }) || [];
    setHasUnsavedChanges(true);
    onUpdate({ dependsOn: updatedDependencies });
  };

  const handleSave = () => {
    onUpdate({
      dependsOn: question.dependsOn,
      options: question.options
    });
    setHasUnsavedChanges(false);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-2">
          <Label>Add Dependency on Previous Question</Label>
          <Select
            onValueChange={(value) => handleAddDependency(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select dependent question" />
            </SelectTrigger>
            <SelectContent>
              {previousQuestions.map((q) => (
                <SelectItem key={q.id} value={q.id.toString()}>
                  {q.question}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {question.dependsOn?.map((dependency) => {
          const dependentQuestion = questions.find(q => q.id === dependency.questionId);
          if (!dependentQuestion) return null;

          return (
            <div key={dependency.questionId} className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{dependentQuestion.question}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDependency(dependency.questionId)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {dependentQuestion.options.map((option) => (
                  <Badge
                    key={option.id}
                    variant={dependency.options.includes(option.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleOptionDependencyChange(
                      dependency.questionId,
                      option.id,
                      !dependency.options.includes(option.id)
                    )}
                  >
                    {option.text}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <Label>Option Dependencies</Label>
        {question.type === 'multiple-choice' && question.options.map((option) => (
          <div key={option.id} className="p-4 border rounded-lg space-y-2">
            <h4 className="font-medium">{option.text}</h4>
            <div className="space-y-2">
              {previousQuestions
                .filter(q => q.type === 'multiple-choice')
                .map((prevQuestion) => (
                  <div key={prevQuestion.id} className="space-y-2">
                    <Label className="text-sm text-gray-600">{prevQuestion.question}</Label>
                    <div className="flex flex-wrap gap-2">
                      {prevQuestion.options.map((prevOption) => (
                        <Badge
                          key={prevOption.id}
                          variant={
                            option.dependsOn?.some(dep => 
                              dep.questionId === prevQuestion.id && 
                              dep.optionId === prevOption.id
                            ) ? "default" : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => {
                            const newDependsOn = [...(option.dependsOn || [])];
                            const existingDep = newDependsOn.findIndex(dep => 
                              dep.questionId === prevQuestion.id && 
                              dep.optionId === prevOption.id
                            );
                            
                            if (existingDep >= 0) {
                              newDependsOn.splice(existingDep, 1);
                            } else {
                              newDependsOn.push({
                                questionId: prevQuestion.id,
                                optionId: prevOption.id
                              });
                            }
                            
                            const updatedOptions = question.options.map(opt =>
                              opt.id === option.id 
                                ? { ...opt, dependsOn: newDependsOn }
                                : opt
                            );
                            
                            setHasUnsavedChanges(true);
                            onUpdate({ options: updatedOptions });
                          }}
                        >
                          {prevOption.text}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {hasUnsavedChanges && (
        <Button 
          onClick={handleSave}
          className="w-full"
          variant="outline"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      )}
    </div>
  );
};
