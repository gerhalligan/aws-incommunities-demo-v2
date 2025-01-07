import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question, RepeaterEntry, RepeaterField } from "@/types/quiz";
import { toast } from "sonner";
import { getBranchAnswers } from "@/services/answers";

interface RepeaterQuestionProps {
  question: Question;
  entries: RepeaterEntry[];
  onEntriesChange: (entries: RepeaterEntry[]) => void;
  onStartBranch?: (entryId: string) => void; // New prop for handling branching
  questions: Question[]; // Add this
  currentQuestionIndex: number; // Add this
  isLastQuestion?: boolean;
}

interface EntryProgressProps {
  entryId: string;
  branches?: RepeaterBranch[];
  totalQuestions: number;
}

interface CompletionIndicatorProps {
  isComplete: boolean;
}

const EntryProgress = ({ entryId, totalQuestions, question }: EntryProgressProps & { question: Question }) => {
  const [progress, setProgress] = useState({ answeredQuestions: 0, isComplete: false });
  
  useEffect(() => {
    const loadProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { answers, isComplete } = await getBranchAnswers(
        user.id, 
        question.id,
        entryId
      );

      setProgress({
        answeredQuestions: answers.length,
        isComplete: answers.length === totalQuestions
      });
    };

    loadProgress();
  }, [entryId, question.id]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-300",
            progress.answeredQuestions === totalQuestions ? "bg-green-500" : "bg-amber-500",
          )}
          style={{ width: `${(progress.answeredQuestions / totalQuestions) * 100}%` }}
        />
      </div>
      <span className={cn(
        "text-sm font-medium",
        progress.answeredQuestions === totalQuestions ? "text-green-600" : "text-amber-600"
      )}>
        {progress.answeredQuestions === totalQuestions ? (
          "Complete"
        ) : progress.answeredQuestions > 0 ? (
          `${progress.answeredQuestions}/${totalQuestions}`
        ) : (
          "Not started"
        )}
      </span>
    </div>
  );
};


const CompletionIndicator = ({ isComplete }: CompletionIndicatorProps) => {
  if (!isComplete) return null;
  
  return (
    <div 
      className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
      title={isComplete ? "Questions completed" : undefined}
    />
  );
};

const RepeaterField = ({ field, value, onChange, error }: {
  field: RepeaterField;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
}) => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <Input
          type={field.type}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          className={cn(error && "border-red-500")}
        />
      );
    
    case 'textarea':
      return (
        <Textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          className={cn(error && "border-red-500")}
        />
      );
    
    case 'select':
      return (
        <Select
          value={value as string}
          onValueChange={onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    
    case 'radio':
      return (
        <div className="space-y-2">
          {field.options?.map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="radio"
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                required={field.required}
              />
              {option}
            </label>
          ))}
        </div>
      );
    
    case 'checkbox':
      return (
        <div className="space-y-2">
          {field.options?.map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={option}
                checked={(value as string[])?.includes(option)}
                onChange={(e) => {
                  const currentValues = (value as string[]) || [];
                  const newValues = e.target.checked
                    ? [...currentValues, option]
                    : currentValues.filter(v => v !== option);
                  onChange(newValues);
                }}
                required={field.required}
              />
              {option}
            </label>
          ))}
        </div>
      );
    
    default:
      return null;
  }
};

export const RepeaterQuestion = ({ 
  question,
  entries,
  onEntriesChange,
  onStartBranch,
  questions,
  currentQuestionIndex,
  isLastQuestion
}: RepeaterQuestionProps) => {
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  const [branchStatuses, setBranchStatuses] = useState<Record<string, { 
    hasStarted: boolean,
    isComplete: boolean 
  }>>({});

  const handleAddEntry = () => {
    const newEntry: RepeaterEntry = {
      id: crypto.randomUUID(),
      values: {},
    };
    const updatedEntries = [...entries, newEntry];
    // Update entries immediately
    onEntriesChange(updatedEntries);
    // Force an update of the repeater answer
    onEntriesChange(updatedEntries);
  };

  const handleRemoveEntry = (entryId: string, index: number) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <h3 className="font-medium mb-2">Delete Entry {index + 1}?</h3>
        <p className="text-sm text-gray-600 mb-4">This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toast.dismiss(t)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onEntriesChange(entries.filter(entry => entry.id !== entryId));
              toast.dismiss(t);
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    ));
  };

  const handleFieldChange = (entryId: string, fieldId: string, value: string | string[]) => {
    const newEntries = entries.map(entry =>
      entry.id === entryId
        ? {
            ...entry,
            values: {
              ...entry.values,
              [fieldId]: value,
            },
          }
        : entry
    );
    onEntriesChange(newEntries);
    
    // Clear error when field is changed
    if (errors[entryId]?.[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [entryId]: {
          ...prev[entryId],
          [fieldId]: undefined,
        },
      }));
    }
  };

  const validateEntry = (entry: RepeaterEntry) => {
    const entryErrors: Record<string, string> = {};
    
    question.repeaterConfig?.fields.forEach(field => {
      const value = entry.values[field.id];
      
      if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
        entryErrors[field.id] = 'This field is required';
      }
      
      // Add more validation as needed
    });
    
    return entryErrors;
  };

  const canAddMore = !question.repeaterConfig?.maxEntries || 
                     entries.length < question.repeaterConfig.maxEntries;

  // Add useEffect to load branch statuses
  useEffect(() => {
    const loadBranchStatuses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const remainingQuestions = questions.length - currentQuestionIndex - 1;
      const statuses: Record<string, { hasStarted: boolean, isComplete: boolean }> = {};
      
      for (const entry of entries) {
        const { hasStarted, isComplete } = await getBranchAnswers(
          user.id,
          question.id,
          entry.id,
          remainingQuestions
        );
        statuses[entry.id] = { hasStarted, isComplete };
      }
      
      setBranchStatuses(statuses);
    };
  
    if (question.repeaterConfig?.branchable) {
      loadBranchStatuses();
    }
  }, [entries, question.id, questions.length, currentQuestionIndex]);

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <Card key={entry.id} className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Entry {index + 1}</h3>
            <div className="flex items-center gap-4">
              {question.repeaterConfig?.branchable && (
                <>
                  <EntryProgress 
                    entryId={entry.id}
                    question={question}
                    totalQuestions={questions.length - (currentQuestionIndex+1)} // Get actual remaining questions
                  />
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('Starting branch for entry:', entry.id);
                      onStartBranch?.(entry.id);
                    }}
                    className={cn(
                      "relative",
                      branchStatuses[entry.id]?.isComplete && "bg-green-50 border-green-200"
                    )}
                  >
                    <CompletionIndicator 
                      isComplete={branchStatuses[entry.id]?.isComplete || false}
                    />
                    {branchStatuses[entry.id]?.isComplete ? (
                      "Review Questions"
                    ) : branchStatuses[entry.id]?.hasStarted ? (
                      "Continue Questions"
                    ) : (
                      "Start Questions"
                    )}
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveEntry(entry.id, index)}
                disabled={entries.length <= (question.repeaterConfig?.minEntries || 1)}
              >
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {question.repeaterConfig?.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <RepeaterField
                  field={field}
                  value={entry.values[field.id] || ''}
                  onChange={(value) => handleFieldChange(entry.id, field.id, value)}
                  error={errors[entry.id]?.[field.id]}
                />
                {errors[entry.id]?.[field.id] && (
                  <p className="text-sm text-red-500">{errors[entry.id][field.id]}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      {canAddMore && (
        <Button onClick={handleAddEntry} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      )}
    </div>
  );
};