import { useState, useEffect, useCallback } from "react";
import { Question, Option } from "@/types/quiz";
import { loadQuizState, saveQuizState } from "@/services/quiz"; 
import { saveAnswer, getAnswer } from "@/services/answers";
import { useView } from "@/contexts/ViewContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateAIResponse } from "@/services/ai";
import { getBranchAnswers } from "@/services/answers";

export const useQuizState = () => {
  const { currentView } = useView();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Map<number, string | Option>>(new Map());
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newOption, setNewOption] = useState("");
  const [questionHistory, setQuestionHistory] = useState<number[]>([0]);
  const [isCompleted, setIsCompleted] = useState(false);
  const currentQuestion = questions[currentQuestionIndex];
  const [currentBranch, setCurrentBranch] = useState<RepeaterBranch | null>(null);
  const [repeaterBranches, setRepeaterBranches] = useState<Map<number, RepeaterBranch[]>>(new Map());
  const [aiAnalysis, setAiAnalysis] = useState<string>("");


  const checkIsLastBranchQuestion = (question: Question): boolean => {
    console.log('checkIsLastBranchQuestion.question', question);
    console.log('checkIsLastBranchQuestion.currentBranch', currentBranch);
    // If we're not in a branch, it's not a branch question
    if (!currentBranch) return false;
  
    // Check if this is the last question in the sequence
    const currentIndex = questions.indexOf(question);
    const nextQuestion = questions[currentIndex + 1];

    console.log('checkIsLastBranchQuestion.currentIndex', currentIndex);
    console.log('checkIsLastBranchQuestion.nextQuestion', nextQuestion);
  
    // It's the last question if there is no defaultNextQuestionId
    return !nextQuestion;
  };

  const handleStartBranch = async (questionId: number, entryId: string) => {
    console.log('handleStartBranch called with:', { questionId, entryId });

    // Find the parent repeater question
    const parentQuestion = questions.find(q => q.id === questionId);
    if (!parentQuestion?.repeaterConfig) return;



    // Save repeater answer first if it exists
   if (inputValue) {
     try {
       await saveAnswer(questionId, { value: inputValue });
       // Update answers state immediately after saving
       setAnswers(prev => new Map(prev).set(questionId, { value: inputValue }));
     } catch (error) {
       console.error('Error saving repeater answer:', error);
       toast({
         title: "Error",
         description: "Failed to save repeater answer",
         variant: "destructive"
       });
       return;
     }
   }
    
    // Try inputValue first, then fall back to answers map
    const repeaterAnswer = inputValue || answers.get(questionId);
    let entryValues = {};
    let entryIndex = -1;
    
    if (repeaterAnswer && typeof repeaterAnswer === 'string') {
      try {
        const parsed = JSON.parse(repeaterAnswer);
        entryIndex = parsed.entries?.findIndex(e => e.id === entryId);
        entryValues = parsed.entries?.[entryIndex]?.values || {};
        console.log('Found entry values:', entryValues);
      } catch (e) {
        console.error('Error parsing repeater answer:', e);
      }
    }
  
    // Create new branch with parent question's repeater config
    const branch: RepeaterBranch = {
      entryId,
      entryValues,
      branchAnswers: new Map(),
      isComplete: false,
      parentQuestion: {
        id: parentQuestion.id,
        repeaterConfig: parentQuestion.repeaterConfig
      },
      entryIndex: entryIndex + 1 // Store 1-based index
    };
    
    
    // Update branches state first
    const branches = repeaterBranches.get(questionId) || [];
    const updatedBranches = [...branches, branch];
    setRepeaterBranches(new Map(repeaterBranches).set(questionId, updatedBranches));
    
    // Update parent question with branches
    const updatedQuestion = {
      ...parentQuestion,
      repeaterBranches: updatedBranches
    };
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? updatedQuestion : q
    );
    setQuestions(updatedQuestions);
    
    // Set current branch after updating all state
    setCurrentBranch(branch);


    // Simply move to the next question in sequence
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setQuestionHistory(prev => [...prev, nextIndex]);
    }
  };
  
  const handleReturnToRepeater = () => {
     console.log('handleReturnToRepeater.currentBranch', currentBranch);
    
    if (currentBranch) {
       // Only mark as complete if we're on the last question
      const updatedBranch = checkIsLastBranchQuestion(currentQuestion) 
        ? { ...currentBranch, isComplete: true }
        : currentBranch;

      console.log('questions', questions);
      
      // Find parent repeater question
      const repeaterQuestion = questions.find(q => q.id === currentBranch.parentQuestion?.id);
  
      if (repeaterQuestion) {
        // Update branches for the repeater question
        const existingBranches = repeaterBranches.get(repeaterQuestion.id) || [];
        const updatedBranches = existingBranches.map(b => 
          b.entryId === currentBranch.entryId ? updatedBranch : b
        );
        
        setRepeaterBranches(new Map(repeaterBranches).set(repeaterQuestion.id, updatedBranches));
        setCurrentBranch(null);
        
        // Return to repeater question
        const repeaterIndex = questions.indexOf(repeaterQuestion);
        setCurrentQuestionIndex(repeaterIndex);
        setQuestionHistory(prev => [...prev.slice(0, prev.indexOf(repeaterIndex) + 1)]);
      }
    }
  };

   useEffect(() => {
    const loadState = async () => {
      try {
        const loadedQuestions = await loadQuizState();
        if (!loadedQuestions) {
          console.log("No questions loaded");
          setQuestions([]);
          return;
        }
        setQuestions(loadedQuestions);
        
        // Check for forced completion state
        const forceComplete = window.localStorage.getItem("force_quiz_complete");
        if (forceComplete === "true") {
          setIsCompleted(true);
          setCurrentQuestionIndex(-1);
          // Remove the flag after using it
          window.localStorage.removeItem("force_quiz_complete");
        }
      } catch (error) {
        console.error("Error loading quiz state:", error);
        toast.error("Failed to load questions. Please try refreshing the page.");
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);
  
useEffect(() => {
  const loadAnswer = async () => {
    if (!currentQuestion?.id || currentView !== "user" ) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const branchContext = currentBranch ? {
        branchId: currentBranch.entryId,
        parentQuestionId: currentBranch.parentQuestion?.id,
        entryId: currentBranch.entryId
      } : undefined;

      const savedAnswer = await getAnswer(user.id, currentQuestion.id, branchContext);
      
      if (!savedAnswer) {
        setInputValue('');
        setSelectedOption(null);
        return;
      }

      // Handle branch answers
      if (currentBranch) {
        const updatedBranch = {
          ...currentBranch,
          branchAnswers: new Map(currentBranch.branchAnswers).set(
            currentQuestion.id,
            savedAnswer
          )
        };
        
        // Update branches for parent question
        if (currentBranch.parentQuestion?.id) {
          const existingBranches = repeaterBranches.get(currentBranch.parentQuestion.id) || [];
          const updatedBranches = existingBranches.map(b => 
            b.entryId === currentBranch.entryId ? updatedBranch : b
          );
          
          // Only update if branches have changed
          const currentBranches = repeaterBranches.get(currentBranch.parentQuestion.id) || [];
          const branchesChanged = JSON.stringify([...currentBranches]) !== JSON.stringify([...updatedBranches]);
          
          if (branchesChanged) {
            setRepeaterBranches(prev => {
              const newMap = new Map(prev);
              newMap.set(currentBranch.parentQuestion.id, updatedBranches);
              return newMap;
            });
          }
        }
        
        setCurrentBranch(updatedBranch);
      }

      // Update answers map
      setAnswers(prev => new Map(prev).set(currentQuestion.id, savedAnswer));

      // Set UI state based on answer type
      if (currentQuestion.type === 'input') {
        const newValue = typeof savedAnswer === 'string' 
          ? savedAnswer 
          : savedAnswer.value;
      
        if (inputValue !== newValue) {
          setInputValue(newValue);
        }
        setSelectedOption(null);
      
        // Only set AI analysis if it's a stored answer and has AI analysis
        if (savedAnswer._isStoredAnswer && savedAnswer.aiAnalysis) {
          setAiAnalysis(savedAnswer.aiAnalysis);
        }
      } else if (currentQuestion.type === 'multiple-choice') {
        const option = currentQuestion.options.find(opt => opt.id === savedAnswer?.id);
      
        if (option && (!selectedOption || selectedOption.id !== option.id)) {
          setSelectedOption(option);
      
          // Only set AI analysis if it's a stored answer and has AI analysis
          if (savedAnswer._isStoredAnswer && savedAnswer.aiAnalysis) {
            setAiAnalysis(savedAnswer.aiAnalysis);
          }
        }
      
        if (inputValue !== '') {
          setInputValue('');
        }
      } else if (currentQuestion.type === 'repeater') {
        // For repeater, use the `rawValue` (if provided) or the saved answer directly
        const repeaterValue = savedAnswer?.rawValue || savedAnswer?.value || savedAnswer;
      
        if (inputValue !== repeaterValue) {
          setInputValue(repeaterValue);
        }
        setSelectedOption(null);
      
        // Handle AI analysis if enabled
        if (savedAnswer._isStoredAnswer && savedAnswer.aiAnalysis) {
          setAiAnalysis(savedAnswer.aiAnalysis);
        }
      }
      
      // Ensure all question types can handle files if needed
      if (savedAnswer?.files) {
        setUploadedFiles(savedAnswer.files);
      }


    } catch (error) {
      console.error("Error loading answer:", error);
    }
  };
  loadAnswer();
}, [currentQuestion?.id, currentView, isCompleted, currentBranch?.id]); // Only depend on currentBranch.id



  const handleUpdateQuestions = useCallback(async (newQuestions: Question[]) => {
    try {
      console.log("handleUpdateQuestions - before saveQuizState call:", newQuestions);
      await saveQuizState(newQuestions);
      setQuestions(newQuestions);
    } catch (error) {
      console.error("Error saving quiz state:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz state",
        variant: "destructive",
      });
    }
  }, []);

const getFilteredOptions = useCallback(() => {
    let filteredOptions = currentQuestion.options;

    // Filter options based on their dependencies
    filteredOptions = filteredOptions.filter(option => {
      // If option has no dependencies, always show it
      if (!option.dependsOn) {
        return true;
      }

      // Check each dependency
      return option.dependsOn.every(dep => {
        const dependentAnswer = answers.get(dep.questionId);
        if (!dependentAnswer || typeof dependentAnswer !== 'object') {
          return false;
        }
        return dependentAnswer.id === dep.optionId;
      });
    });

    return filteredOptions.filter((option) =>
      option.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentQuestion, answers, searchQuery]);

  const handleOptionSelect = async (option: Option) => {
    //console.log('handleOptionSelect called with option:', option);
    setSelectedOption(option);
    if (currentQuestion.aiLookup?.enabled && currentQuestion.aiLookup?.prompt) {
      try {
        //console.log('AI Lookup enabled, generating prompt...');
        let prompt = currentQuestion.aiLookup.prompt;
        prompt = prompt.replace("{{question}}", currentQuestion.question);
        prompt = prompt.replace("{{answer}}", option.text);
        //console.log('Generated prompt:', prompt);
  
        //console.log('Calling generateAIResponse...');
        const response = await generateAIResponse(prompt);
        //console.log('AI Response received:', response);
        
        //console.log('Saving answer with AI analysis...');
        await saveAnswer(currentQuestion.id, option, response);
        //console.log('Answer saved successfully');
        
        // Update local state
        //console.log('Updating local answers state...');
        setAnswers(prev => {
          const newAnswers = new Map(prev);
          newAnswers.set(currentQuestion.id, {
            ...option,
            aiAnalysis: response
          });
          //console.log('New answers state:', Object.fromEntries(newAnswers));
          return newAnswers;
        });
      } catch (error) {
        console.error("Error in handleOptionSelect:", error);
        toast({
          title: "Error",
          description: "Failed to generate AI response",
          variant: "destructive",
        });
      }
    } else {
      console.log('AI Lookup not enabled for this question');
    }
  };


  const handleInputSubmit = async (value: string, branchContext?: BranchContext) => {
    //console.log('handleInputSubmit called with value:', value);
    //console.log('Branch context:', branchContext);
    setInputValue(value);

    // Save answer without AI analysis
    try {
        console.log('Saving answer without AI analysis...');
        const answerData = { value };

        //don't do the AI Lookup here as it runs whenever the user types in a char. the AI lookup is saved after the user clicks the lookup ai button

        // Check for AI lookup
        /*if (currentQuestion.aiLookup?.enabled && currentQuestion.aiLookup?.prompt) {
          console.log('AI Lookup enabled, generating prompt...');
          let prompt = currentQuestion.aiLookup.prompt;
          prompt = prompt.replace("{{question}}", currentQuestion.question);
          prompt = prompt.replace("{{answer}}", value);
    
          console.log('Calling generateAIResponse...');
          const response = await generateAIResponse(prompt);
          console.log('AI Response received:', response);
          
          // Include AI analysis in answer data
          answerData.aiAnalysis = response;
        }*/

        //console.log('handleInputSubmit.answerData (before save)', answerData)
      
       // Check if this is a repeater question and if we already have an answer
      if (currentQuestion.type === 'repeater') {
         const existingAnswer = await getAnswer(
           (await supabase.auth.getUser()).data.user.id,
           currentQuestion.id,
           branchContext
         );
         
         if (existingAnswer) {
           // Update existing answer
           await saveAnswer(currentQuestion.id, answerData, undefined, true, branchContext);
         } else {
           // Create new answer
           await saveAnswer(currentQuestion.id, answerData, undefined, false, branchContext);
         }
       } else {
         // For non-repeater questions, proceed as normal
         await saveAnswer(currentQuestion.id, answerData, undefined, false, branchContext);
       }

        setAnswers(prev => {
            const newAnswers = new Map(prev);
            newAnswers.set(currentQuestion.id, answerData);
            //console.log('New answers state:', Object.fromEntries(newAnswers));
            return newAnswers;
        });
    } catch (error) {
        console.error("Error saving answer:", error);
        toast({
            title: "Error",
            description: "Failed to save answer",
            variant: "destructive",
        });
    }
};
 
  const isQuestionValid = (questionId: number, previousAnswers: Map<number, string>) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return false;

    if (!question.dependsOn) return true;

    return question.dependsOn.every(dependency => {
      const answer = previousAnswers.get(dependency.questionId);
      return answer && dependency.options.includes(answer);
    });
  };

  const handleUpdateQuestion = (updates: Partial<Question>) => {
  // Deep clone the current question to avoid reference issues
  const currentQuestionCopy = JSON.parse(JSON.stringify(currentQuestion));

  const updatedQuestions = questions.map(q => 
    q.id === currentQuestion.id 
      ? {
          ...currentQuestionCopy,
          ...updates,
          // For aiLookup, handle enabled state correctly
          aiLookup: updates.aiLookup !== undefined 
            ? {
                ...currentQuestionCopy.aiLookup,
                ...updates.aiLookup,
                // If enabled is false, reset other properties
                ...(updates.aiLookup.enabled === false && {
                  prompt: '',
                  response: undefined
                })
              }
            : currentQuestionCopy.aiLookup,
          // For fileUploadMetadata, handle enabled state correctly
          fileUploadMetadata: updates.fileUploadMetadata !== undefined
            ? {
                ...currentQuestionCopy.fileUploadMetadata,
                ...updates.fileUploadMetadata,
                // If enabled is false, reset other properties
                ...(updates.fileUploadMetadata.enabled === false && {
                  maxFiles: 1,
                  required: false,
                  fileLabels: ['Upload File'],
                  fileRequirements: [false],
                  formConfigs: [[]]
                })
              }
            : currentQuestionCopy.fileUploadMetadata
        }
      : q
  );
  
  handleUpdateQuestions(updatedQuestions);
};


  const handleNext = async () => {
    // For multiple choice questions
    if (currentQuestion.type === 'multiple-choice' && !selectedOption) return;
    
    // For repeater questions
    if (currentQuestion.type === "repeater") {
    let entries = [];
  
    // Safely parse inputValue or handle it as a pre-parsed object
    try {
      if (typeof inputValue === "string") {
        const parsedInput = JSON.parse(inputValue); // Parse the JSON string
        if (parsedInput && Array.isArray(parsedInput.entries)) {
          entries = parsedInput.entries;
        } else {
          throw new Error("Invalid repeater input format");
        }
      } else if (typeof inputValue === "object" && Array.isArray(inputValue.entries)) {
        entries = inputValue.entries; // Use pre-parsed object
      } else {
        throw new Error("Unexpected inputValue format for repeater");
      }
    } catch (error) {
      console.error("Error parsing repeater input value:", error);
      toast({
        title: "Error",
        description: "Invalid repeater input format. Please correct your data.",
        variant: "destructive",
      });
      return;
    }
  
    const config = currentQuestion.repeaterConfig;
  
    // Check if all entries have completed their branched questions dynamically
    if (config?.branchable) {
      const remainingQuestions = questions.length - currentQuestionIndex - 1;
      const incompleteEntries = [];
  
      for (const entry of entries) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("User not authenticated");
  
          const { isComplete } = await getBranchAnswers(
            user.id,
            currentQuestion.id,
            entry.id,
            remainingQuestions
          );
  
          if (!isComplete) {
            incompleteEntries.push(entry);
          }
        } catch (error) {
          console.error(`Error checking branch status for entry ${entry.id}:`, error);
          toast({
            title: "Error",
            description: `Failed to check branch status for entry ${entry.id}`,
            variant: "destructive",
          });
          return;
        }
      }
  
      if (incompleteEntries.length > 0) {
        toast({
          title: "Incomplete Entries",
          description: `Please complete the questions for ${incompleteEntries.length} entries`,
          variant: "destructive",
        });
        return;
      }
  
      // If all entries are complete and this is a branchable repeater, end the questionnaire
      setIsCompleted(true);
      setCurrentQuestionIndex(-1);
      return;
    }
  
    // Validate minimum entries
    if (config?.minEntries && entries.length < config.minEntries) {
      toast({
        title: "Validation Error",
        description: `Please add at least ${config.minEntries} entries`,
        variant: "destructive",
      });
      return;
    }
  
    // Validate required fields
    const hasInvalidEntries = entries.some((entry) => {
      return config?.fields.some((field) => {
        if (field.required) {
          const value = entry.values[field.id];
          return !value || (Array.isArray(value) && value.length === 0);
        }
        return false;
      });
    });
  
    if (hasInvalidEntries) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
  }

  
    // Store the current answer
    const currentAnswer = selectedOption || inputValue;
    if (currentAnswer) {
     
       // Update branch answers if in a branch
     if (currentBranch) {
       const updatedBranch = {
         ...currentBranch,
         branchAnswers: new Map(currentBranch.branchAnswers).set(
           currentQuestion.id,
           currentAnswer
         )
       };
       
       // Update branches for parent question
       const parentId = currentBranch.parentQuestion?.id;
       if (parentId) {
         const existingBranches = repeaterBranches.get(parentId) || [];
         const updatedBranches = existingBranches.map(b => 
           b.entryId === currentBranch.entryId ? updatedBranch : b
         );
         setRepeaterBranches(new Map(repeaterBranches).set(parentId, updatedBranches));
       }
       
       setCurrentBranch(updatedBranch);
     } else {
       // Update main answers map only if not in a branch
       setAnswers(prev => new Map(prev).set(currentQuestion.id, currentAnswer));
     }

      // Only save answers in user view
      if (currentView === "user") {
        try {
          // Create branch context if we're in a branch
         const branchContext = currentBranch ? {
           parentQuestionId: currentBranch.parentQuestion?.id,
           entryId: currentBranch.entryId,
           entryIndex: currentBranch.entryIndex
         } : undefined;
         
         await saveAnswer(currentQuestion.id, currentAnswer, undefined, false, branchContext);
        } catch (error) {
          console.error("Error saving answer:", error);
          toast({
            title: "Error",
            description: "Failed to save answer",
            variant: "destructive",
          });
        }
      }
    }

    setIsTransitioning(true);
      setTimeout(() => {
        let nextIndex;
        
        // If we're in a branch, use the current question's defaultNextQuestionId
        if (currentBranch) {          
          if (checkIsLastBranchQuestion(currentQuestion)) { 
            
            handleReturnToRepeater();
            setIsTransitioning(false);
            return;
          }

          nextIndex = currentQuestionIndex + 1;
        } else {
          // Normal question flow
          if (currentQuestion.type === 'multiple-choice' && selectedOption?.nextQuestionId) {
            nextIndex = questions.findIndex(q => q.id === selectedOption.nextQuestionId);
          } else if (currentQuestion.defaultNextQuestionId) {
            nextIndex = questions.findIndex(q => q.id === currentQuestion.defaultNextQuestionId);
          } else {
            nextIndex = currentQuestionIndex + 1;
          }
        }
    
        if (nextIndex !== -1 && nextIndex < questions.length) {
          setQuestionHistory(prev => [...prev, nextIndex]);
          setCurrentQuestionIndex(nextIndex);
        } else {
          setIsCompleted(true);
          setCurrentQuestionIndex(-1);
        }
        
        // Clear input values after transition
        setSelectedOption(null);
        setInputValue("");
        setSearchQuery("");
        
        setIsTransitioning(false);
      }, 500);
    };

  const handleBack = () => {
    if (questionHistory.length > 1) {
      setIsTransitioning(true);
  
      setTimeout(() => {
        const newHistory = [...questionHistory];
        newHistory.pop(); // Remove current question
        const previousIndex = newHistory[newHistory.length - 1];
        
        // If we're in a branch and going back to the parent repeater
        if (currentBranch && questions[previousIndex].type === 'repeater') {
          // Exit the branch entirely
          handleReturnToRepeater();
        } else {
          // Normal back navigation
          setQuestionHistory(newHistory);
          setCurrentQuestionIndex(previousIndex);
          
          // Clear input values after transition
          setSelectedOption(null);
          setInputValue("");
          setSearchQuery("");
        }
        
        setIsTransitioning(false);
      }, 500);
    }
  };


  const handleAddOption = () => {
    if (currentQuestion.type !== 'multiple-choice') return;
    
    if (newOption.trim() && !currentQuestion.options.some(opt => opt.text === newOption.trim())) {
      const updatedQuestions = JSON.parse(JSON.stringify(questions));
      const newOptionObj: Option = {
        id: `${currentQuestion.id}${String.fromCharCode(97 + currentQuestion.options.length)}`,
        text: newOption.trim()
      };
      
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        options: [...currentQuestion.options, newOptionObj],
      };
      handleUpdateQuestions(updatedQuestions);
      setNewOption("");
    }
  };

  const handleRemoveOption = (optionToRemove: Option) => {
    const updatedQuestions = JSON.parse(JSON.stringify(questions));
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      options: currentQuestion.options.filter(option => option.id !== optionToRemove.id),
    };
    handleUpdateQuestions(updatedQuestions);
    if (selectedOption?.id === optionToRemove.id) {
      setSelectedOption(null);
    }
  };

  const handleQuestionsReorder = (reorderedQuestions: Question[]) => {
    handleUpdateQuestions(reorderedQuestions);
  };

  return {
    isLoading,
    questions,
    currentQuestion,
    currentQuestionIndex,
    selectedOption,
    searchQuery,
    isTransitioning,
    newOption,
    canGoBack: questionHistory.length > 1,
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
    setAnswers,
    setIsCompleted,
    handleInputSubmit,
    setCurrentQuestionIndex,
    questionHistory,
    currentBranch,
    repeaterBranches,
    handleStartBranch,
    handleReturnToRepeater,
    isLastBranchQuestion: checkIsLastBranchQuestion,
    aiAnalysis,
    setAiAnalysis,
    inputValue
  };
};
