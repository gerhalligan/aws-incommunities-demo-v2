import { useState, useCallback, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import { OptionsList } from "./OptionsList";
import { InputQuestion } from "./InputQuestion";
import { FileUpload } from "./FileUpload";
import { AIResponse } from "./AIResponse";
import { RepeaterQuestion } from "./RepeaterQuestion";
import { Question, Option } from "@/types/quiz";
import { generateAIResponse } from "@/services/ai";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface ReturnToRepeaterProps {
  onReturn: () => void;
  isVisible: boolean;
}

interface BranchHeaderProps {
  entryValues: Record<string, string | string[]>;
  parentQuestion: Question;
  currentBranch: RepeaterBranch | null;
}

const BranchHeader = ({ entryValues, parentQuestion, currentBranch }: BranchHeaderProps) => {
  if (!entryValues) return null;
  
  console.log('BranchHeader.parentQuestion', parentQuestion);

  const fields = parentQuestion?.repeaterConfig?.fields || [];
  const entryNumber = currentBranch?.entryIndex || null;

  return (
    <div></div>
    /*<div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
      <div className="flex flex-col gap-2">
        <div className="text-sm font-medium text-purple-700">Entry {entryNumber} Details</div>
        <div className="grid gap-2">
          {fields.map(field => {
            const value = entryValues[field.id];
            return (
              <div key={field.id} className="flex items-center gap-2">
                <span className="text-sm font-medium text-purple-700">{field.label}:</span>
                <span className="text-sm text-purple-900">
                  {value || 'Not set'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>*/
  );
};

const ReturnToRepeaterButton = ({ onReturn, isVisible }: ReturnToRepeaterProps) => {
  if (!isVisible) return null;

  return (
    <Button 
      onClick={onReturn}
      className="mt-4"
      variant="outline"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Return to Repeater
    </Button>
  );
};

interface QuizContentProps {
  currentQuestion: Question;
  selectedOption: Option | null;
  searchQuery: string;
  currentView: string;
  onOptionSelect: (option: Option) => void;
  onRemoveOption: (option: Option) => void;
  onSearchQueryChange: (query: string) => void;
  onInputSubmit: (value: string) => void;
  onFileUpload: (files: File[], index: number) => void;
  getFilteredOptions: () => Option[];
  initialInputValue: string;
  storedAiAnalysis?: string;
  answers: Map<number, string | Option>;
  onFormDataChange?: (formData: Record<string, string>[]) => void;
  onReturn: () => void;
  onStartBranch?: (entryId: string) => void;
  currentBranch?: RepeaterBranch | null;
  isTransitioning?: boolean;
  questions: Question[];
  handleNext: () => void;
  handleBack: () => void;
  questionHistory: number[];
  currentQuestionIndex: number;
  isLastBranchQuestion: (question: Question) => boolean;
  aiAnalysis: string;
  setAiAnalysis: (value: string) => void;
}

export const QuizContent = ({
  currentQuestion,
  questions,
  selectedOption,
  searchQuery,
  currentView,
  onOptionSelect,
  onRemoveOption,
  onSearchQueryChange,
  onInputSubmit,
  onFileUpload,
  getFilteredOptions,
  initialInputValue,
  storedAiAnalysis,
  answers,
  onFormDataChange,
  onReturn,
  onStartBranch,
  currentBranch,
  isTransitioning,
  handleNext,
  handleBack,
  isLastBranchQuestion,
  currentQuestionIndex,
  questionHistory
}: QuizContentProps) => {
  
  const [aiResponse, setAiResponse] = useState("");
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [inputValue, setInputValue] = useState(initialInputValue);
  const [currentFormData, setCurrentFormData] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    setInputValue(initialInputValue);
  }, [initialInputValue]);

  

  const generateResponse = async (answer: string, buttonId?: string) => {
    if (currentQuestion.aiLookup?.enabled && currentQuestion.aiLookup?.prompt) {
      setIsGeneratingResponse(true);
      try {
        // Get the prompt based on whether a button was clicked
        let prompt;
        if (buttonId) {
          const button = currentQuestion.aiLookup.buttons?.find(b => b.id === buttonId);
          prompt = button?.prompt || '';
        } else {
          prompt = currentQuestion.aiLookup.prompt;
        }
        prompt = prompt.replace("{{question}}", currentQuestion.question);
        prompt = prompt.replace("{{answer}}", answer);

        // Create branch context if we're in a branch
        const branchContext = currentBranch ? {
          parentQuestionId: currentBranch.parentQuestion.id,
          entryId: currentBranch.entryId,
          entryIndex: currentBranch.entryIndex
        } : undefined;
  
        const response = await generateAIResponse(
          prompt, 
          currentQuestion.id,
          { value: answer },
          branchContext,
          buttonId
        );
         // Only update aiResponse if this is not a button response
      
        setAiResponse(response);

      } catch (error) {
        console.error("Error generating AI response:", error);
        toast.error("Failed to generate AI response. Please check your API key in Settings.");
      } finally {
        setIsGeneratingResponse(false);
      }
    }
  };

  const handleOptionSelect = (option: Option) => {
    onOptionSelect(option);
    if (option.text) {
      generateResponse(option.text);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    // Pass the current branch context when submitting input
    onInputSubmit(value, currentBranch ? {
      parentQuestionId: currentBranch.parentQuestion.id,
      entryId: currentBranch.entryId,
      entryIndex: currentBranch.entryIndex
    } : undefined);
  };

  const handleFormDataChange = (formData: Record<string, string>[]) => {
    setCurrentFormData(formData);
    if (onFormDataChange) {
      onFormDataChange(formData);
    }
  };

  if (!currentQuestion) {
    return null;
  }
  
  if (currentQuestion.type === "repeater") {
    let entries = [];
    if (initialInputValue) {
      try {
        // Handle both string and object cases
        const parsed = typeof initialInputValue === 'string' 
          ? (initialInputValue.startsWith('{') ? JSON.parse(initialInputValue) : { entries: [] })
          : initialInputValue;
        entries = parsed.entries || [];
      } catch (e) {
        console.error('Error parsing repeater answer:', e);
        entries = [];
      }
    }
    
    return (
      <div className="space-y-4">
        {isTransitioning && (
         <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
         </div>
       )}
        <RepeaterQuestion
          question={currentQuestion}
          entries={entries}
          onEntriesChange={(entries) => onInputSubmit(JSON.stringify({ entries }))}
          onStartBranch={(entryId) => {
           console.log('Starting branch in QuizContent:', entryId);
           onStartBranch?.(entryId);
         }}
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        isLastQuestion={currentQuestion.repeaterConfig?.branchable}
        />
      </div>
    );
  }

  if (currentQuestion.type === "input") {
    return (
      <div className="space-y-4">
        {currentBranch && (
       <BranchHeader 
         entryValues={currentBranch.entryValues}
         parentQuestion={questions.find(q => q.id === currentBranch.parentQuestion?.id)}
         currentBranch={currentBranch}
       />
     )}
        <InputQuestion
          question={currentQuestion}
          initialValue={inputValue}
          onInputSubmit={handleInputChange}
          onAILookup={generateResponse}
        />
        {currentQuestion.aiLookup?.enabled && (
          <AIResponse
            key={String(currentQuestion.id)}
            isLoading={isGeneratingResponse}
            response={aiResponse}
            onResponseChange={setAiResponse}
            storedAnalysis={storedAiAnalysis}
            question={currentQuestion}
            onAILookup={generateResponse}
            inputValue={inputValue}
            buttonResponses={answers.get(currentQuestion.id)?.buttonResponses || {}}
          />
        )}
         {currentView !== "admin" && currentQuestion.fileUploadMetadata?.enabled && (
          <FileUpload
            question={currentQuestion}
            onFileChange={onFileUpload}
            initialFiles={answers.get(currentQuestion.id)?.files}
            onFormChange={handleFormDataChange}
          />
        )}
        {currentView !== "admin" && (
         <ReturnToRepeaterButton 
           onReturn={onReturn}
           isVisible={currentBranch !== null && !isLastBranchQuestion(currentQuestion)}
         />
       )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
       {currentBranch && (
        <BranchHeader 
          entryValues={currentBranch.entryValues}
          parentQuestion={questions.find(q => q.id === currentBranch.parentQuestion?.id)}
          currentBranch={currentBranch}
        />
      )}    
      <SearchBar value={searchQuery} onChange={onSearchQueryChange} />
      <OptionsList
        options={getFilteredOptions()}
        selectedOption={selectedOption}
        onOptionSelect={handleOptionSelect}
        onRemoveOption={onRemoveOption}
        showRemoveButton={currentView === "admin"}
      />
      {currentView !== "admin" && (
        <>
          <FileUpload
            question={currentQuestion}
            onFileChange={onFileUpload}
            initialFiles={answers.get(currentQuestion.id)?.files}
            onFormChange={handleFormDataChange}
          />

          {currentQuestion.aiLookup?.enabled && (
            <AIResponse
              key={String(currentQuestion.id)}
              isLoading={isGeneratingResponse}
              response={aiResponse}
              onResponseChange={setAiResponse}
              storedAnalysis={storedAiAnalysis} 
              question={currentQuestion}
              onAILookup={generateResponse}
              inputValue={inputValue}
              buttonResponses={answers.get(currentQuestion.id)?.buttonResponses || {}}
            />
          )}

          <ReturnToRepeaterButton 
            onReturn={onReturn}
            isVisible={currentBranch !== null && !isLastBranchQuestion(currentQuestion)}
          />       
        </>
      )}
    </div>
  );
};
