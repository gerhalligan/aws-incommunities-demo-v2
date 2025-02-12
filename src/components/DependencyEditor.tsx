import { useState } from "react";
import { Question } from "@/types/quiz";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  const [optionFilters, setOptionFilters] = useState<Record<number, string>>({});

  const filterOptions = (options: Option[], questionId: number) => {
    const filter = optionFilters[questionId];
    if (!filter) return options;
     return options.filter(opt => 
      opt.text.toLowerCase().includes(filter.toLowerCase())
     );
  };

   const handleSelectAllOptionDependencies = (optionId: string, prevQuestionId: number, filteredOptions: Option[]) => {
    const option = question.options.find(opt => opt.id === optionId);
    const prevQuestion = questions.find(q => q.id === prevQuestionId);
    
    if (!option || !prevQuestion) return;
    
    const allOptionsSelected = filteredOptions.every(prevOpt => 
      option.dependsOn?.some(dep => 
        dep.questionId === prevQuestionId && 
        dep.optionId === prevOpt.id
      )
    );
    
    const updatedOptions = question.options.map(opt => {
      if (opt.id === optionId) {
        const newDependsOn = [...(opt.dependsOn || [])];
        
        if (allOptionsSelected) {
          // Remove all dependencies for this question
          return {
            ...opt,
            dependsOn: newDependsOn.filter(dep => 
              dep.questionId !== prevQuestionId || 
              !filteredOptions.some(opt => opt.id === dep.optionId)
            )
          };
        } else {
          // Add all filtered options as dependencies
           const existingDeps = newDependsOn.filter(dep => 
             dep.questionId !== prevQuestionId || 
            !filteredOptions.some(opt => opt.id === dep.optionId)
           );
          const newDeps = filteredOptions.map(prevOpt => ({
            questionId: prevQuestionId,
            optionId: prevOpt.id
          }));
          return {
            ...opt,
            dependsOn: [...existingDeps, ...newDeps]
          };
        }
      }
      return opt;
    });
    
    setHasUnsavedChanges(true);
    onUpdate({ options: updatedOptions });
  };

  const handleSelectAllOptions = (questionId: number) => {
    const dependency = question.dependsOn?.find(dep => dep.questionId === questionId);
    const dependentQuestion = questions.find(q => q.id === questionId);
    
    if (!dependency || !dependentQuestion) return;
    
    const allOptionsSelected = dependentQuestion.options.length === dependency.options.length;
    
    const updatedDependencies = question.dependsOn?.map(dep => {
      if (dep.questionId === questionId) {
        return {
          ...dep,
          options: allOptionsSelected ? [] : dependentQuestion.options.map(opt => opt.id)
        };
      }
      return dep;
    }) || [];
    
    setHasUnsavedChanges(true);
    onUpdate({ dependsOn: updatedDependencies });
  };

  const handleAddDependency = (dependentQuestionId: number) => {
    if (!question.dependsOn) {
      question.dependsOn = [];
    }
    const updatedDependencies = [
      ...(question.dependsOn || []),
      { questionId: dependentQuestionId, options: [] }
    ];
    handleSave({ dependsOn: updatedDependencies });
  };

  const handleRemoveDependency = (questionId: number) => {
    const updatedDependencies = question.dependsOn?.filter(dep => dep.questionId !== questionId) || [];
    handleSave({ dependsOn: updatedDependencies });
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
    handleSave({ dependsOn: updatedDependencies });
  };

  const handleSave = (updates: Partial<Question>) => {
    onUpdate({
      ...updates
    });
    setHasUnsavedChanges(false);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-2">
          <Label>Add Dependency on Previous Question</Label>
          <Select
            value={question.dependsOn?.[0]?.questionId?.toString() || ""}
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
                 <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAllOptions(dependency.questionId)}
                  >
                    {dependentQuestion.options.length === dependency.options.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDependency(dependency.questionId)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
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
                     <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-600">{prevQuestion.question}</Label>
                       <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="Filter options..."
                          value={optionFilters[prevQuestion.id] || ''}
                         onChange={(e) => setOptionFilters(prev => ({
                           ...prev,
                           [prevQuestion.id]: e.target.value
                         }))}
                          className="h-8 w-48"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const filteredOptions = filterOptions(prevQuestion.options, prevQuestion.id);
                            handleSelectAllOptionDependencies(option.id, prevQuestion.id, filteredOptions);
                          }}
                        >
                          {prevQuestion.options
                            .filter(opt => !optionFilters[prevQuestion.id] || 
                              opt.text.toLowerCase().includes(optionFilters[prevQuestion.id].toLowerCase()))
                            .every(prevOpt => 
                            option.dependsOn?.some(dep => 
                              dep.questionId === prevQuestion.id && 
                              dep.optionId === prevOpt.id
                            )
                          ) ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {prevQuestion.options
                        .filter(opt => !optionFilters[prevQuestion.id] || 
                          opt.text.toLowerCase().includes(optionFilters[prevQuestion.id].toLowerCase()))
                        .map((prevOption) => (
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