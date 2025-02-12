import { useState } from "react";
import { QuestionList } from "./QuestionList";
import { AdminOptions } from "./AdminOptions";
import { useQuizState } from "@/hooks/useQuizState";
import { useView } from "@/contexts/ViewContext";
import { NextButton } from "./NextButton";
import { QuizContent } from "./QuizContent";
import { QuestionEditor } from "./QuestionEditor";
import { ProgressBar } from "./ProgressBar";
import ReportDashboard from "./Reports/pages/ReportDashboard";
import { toast } from "sonner";
import { uploadFile } from "@/services/files";
import { saveAnswer } from "@/services/answers";
import type { FileMetadata, FileUploadAnswer } from "@/types/files";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const QuizComponent = () => {
  const { currentView } = useView();
  const {
    isLoading,
    questions,
    currentQuestion,
    currentQuestionIndex,
    selectedOption,
    searchQuery,
    isTransitioning,
    newOption,
    questionHistory,
    getFilteredOptions,
    handleOptionSelect,
    handleNext,
    handleBack,
    handleAddOption,
    handleRemoveOption,
    handleUpdateQuestion,
    handleQuestionsReorder,
    setNewOption,
    setSearchQuery,
    isCompleted,
    answers,
    setIsCompleted,
    handleInputSubmit,
    setCurrentQuestionIndex,
    setAnswers,
    currentBranch,
    repeaterBranches,
    handleStartBranch,
    handleReturnToRepeater,
    isLastBranchQuestion,
    inputValue
  } = useQuizState();

  const [currentFormData, setCurrentFormData] = useState<Record<string, string>[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  console.log(currentBranch);

  const entryNumber = currentBranch?.entryIndex || null;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state in QuizComponent:', event, !!session);
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleFileUpload = async (files: File[], index: number, formData?: Record<string, string>) => {
     try {
       // Upload file to storage
       const filePath = await uploadFile(files[0], currentQuestion.id, index);
       
       // Create file metadata
       const fileMetadata: FileMetadata = {
         path: filePath,
         name: files[0].name,
         size: files[0].size,
         type: files[0].type,
         formData // Include form data if provided
       };
  
       // Get existing answer or create new one
       const existingAnswer = answers.get(currentQuestion.id) as FileUploadAnswer | undefined;
       const updatedFiles = existingAnswer?.files || [];
       updatedFiles[index] = fileMetadata;
   
       // Save answer with file metadata
       const answer: FileUploadAnswer = {
        files: updatedFiles,
        formData: currentFormData[index] || {} // Use the specific form data for this file
      };
   
       await saveAnswer(currentQuestion.id, answer, undefined, false, currentBranch ? {
        parentQuestionId: currentBranch.parentQuestion?.id,
        entryId: currentBranch.entryId,
        entryIndex: currentBranch.entryIndex
      } : undefined);
       
       // Update local state
       setAnswers(new Map(answers).set(currentQuestion.id, answer));
   
       toast.success("File uploaded successfully");
     } catch (error) {
       console.error("Error uploading file:", error);
       toast.error("Failed to upload file");
     }
   };

  return (
    <div className="container mx-auto px-8 max-w-[1400px]">
      <div className="flex gap-6">
        {isLoading ? (
          <div className="w-full flex items-center justify-center p-8">
            <div className="flex items-center gap-2">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
             <span className="text-lg">Loading...</span>
           </div>
          </div>
        ) : currentView === "admin" && (
          <QuestionList
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionSelect={(index: number) => {
              setSearchQuery("");
              setCurrentQuestionIndex(index);
            }}
            onQuestionsReorder={handleQuestionsReorder}
          />
        )}
        {!isLoading && questions?.length > 0 && (<div className="flex-1">
          <div className="bg-white rounded-xl shadow-lg p-8" id="quiz-container">
            <div
              key={isCompleted ? 'summary' : 'quiz'}
              className={`transition-opacity duration-500 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              {isCompleted ? (
                <ReportDashboard />
              ) : (
                <>
              {currentView === "user" && (
                <div className="mb-6">
                  <ProgressBar 
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={questions.length}
                    currentBranch={currentBranch}
                    questions={questions}
                    currentQuestion={currentQuestion}
                  />
                </div>
              )}

              <div className="flex justify-between items-center mb-6">
                {currentView === "admin" ? (
                  <QuestionEditor
                    question={currentQuestion}
                    questions={questions}
                    onUpdate={handleUpdateQuestion}
                  />
                ) : (
                  <h2 className="text-2xl font-semibold text-gray-800" id="question-text">
                    {currentBranch ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                            Entry {entryNumber} Questions
                          </span>
                        </div>
                        <div className="mt-2 p-3 bg-primary/5 rounded-lg">
                          {Object.entries(currentBranch.entryValues).map(([key, value]) => {
                            console.log('Processing field:', key);
                            console.log('currentBranch:', currentBranch);
                            const field = currentBranch.parentQuestion?.repeaterConfig.fields.find(f => f.id === key);
                            console.log('Found field:', field);
                            return (
                              <div key={key} className="text-sm">
                                <span className="font-medium">{field?.label}:</span> {value}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4">
                          {currentQuestion.question}
                        </div>
                      </div>
                    ) : (
                      currentQuestion.question
                    )}
                  </h2>
                )}
              </div>
              
              {currentView === "admin" && (
                <AdminOptions
                  question={currentQuestion}
                  questions={questions}
                  newOption={newOption}
                  onNewOptionChange={setNewOption}
                  onAddOption={handleAddOption}
                  onUpdateQuestion={handleUpdateQuestion}
                />
              )}
       
              <div className="space-y-4">
                <QuizContent
                  currentQuestion={currentQuestion}
                  questions={questions}
                  selectedOption={selectedOption}
                  searchQuery={searchQuery}
                  currentView={currentView}
                  onOptionSelect={handleOptionSelect}
                  onRemoveOption={handleRemoveOption}
                  onSearchQueryChange={setSearchQuery}
                  onInputSubmit={handleInputSubmit}
                  onFileUpload={handleFileUpload}
                  handleUpdateQuestion={handleUpdateQuestion}
                  getFilteredOptions={getFilteredOptions}
                  initialInputValue={inputValue}
                  answers={answers}
                  onFormDataChange={setCurrentFormData}
                  onReturn={handleReturnToRepeater}
                  onStartBranch={
                    currentQuestion?.type === 'repeater' 
                      ? (entryId: string) => {
                       console.log('Starting branch in QuizComponent:', currentQuestion.id, entryId);
                       handleStartBranch(currentQuestion.id, entryId);
                     }
                    : undefined
                  }
                  currentBranch={currentBranch}
                  isTransitioning={isTransitioning}
                  isLastBranchQuestion={isLastBranchQuestion}
                  currentQuestionIndex={currentQuestionIndex}
                />
              </div>

              {!isCompleted && (                  
              <NextButton 
                onClick={handleNext}
                onBack={handleBack}
                showBack={questionHistory.length > 1}
                isLastBranchQuestion={currentBranch && isLastBranchQuestion(currentQuestion)}
                isBranchableRepeater={currentQuestion?.type === 'repeater' && currentQuestion?.repeaterConfig?.branchable}
              />
              )}
              </>
              )}
            </div>
          </div>
        </div>)}
        {!isLoading && questions?.length === 0 && (
        <div className="w-full flex items-center justify-center p-8">
          <div className="text-lg">No questions available</div>
        </div>
      )}
      </div>
    </div>
  );
};