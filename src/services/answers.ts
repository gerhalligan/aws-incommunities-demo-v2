import { supabase } from "@/integrations/supabase/client";
import { Option } from "@/types/quiz";
import { 
  Answer,
  TextAnswer,
  MultipleChoiceAnswer,
  FileAnswer,
  RepeaterAnswer,
  BranchContext 
} from "@/types/answers";
import { FileMetadata } from "@/types/files";

export const getAnswer = async (
  userId: string, 
  questionId: number,
  branchContext?: BranchContext
): Promise<string | Option | undefined> => {
  console.log('getAnswer called for:', { userId, questionId, branchContext });
  
  if (!questionId) return undefined;

  try {
    let baseQuery = supabase
      .from('question_answers')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', questionId);

    // Use the new branch columns instead of JSON filtering
    if (branchContext) {
      baseQuery = baseQuery
        .eq('parent_repeater_id', branchContext.parentQuestionId)
        .eq('branch_entry_id', branchContext.entryId);
    } else {
      baseQuery = baseQuery
        .is('parent_repeater_id', null)
        .is('branch_entry_id', null);
    }
    
    // Add sorting and limit to get the earliest row
    baseQuery = baseQuery
      .order('created_at', { ascending: true })
      .limit(1);
      
    const { data, error } = await baseQuery.maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No answer found');
        return undefined;
      }
      console.error(`Error fetching answer for question ${questionId}:`, error);
      return undefined;
    }

    if (!data) return undefined;

    const answer = data.answer;

    // Handle repeater answers first
    if (answer.value && typeof answer.value === 'string' && 
        answer.value.startsWith('{') && answer.value.endsWith('}')) {
      return answer.value;
    }

    // Handle file upload answers
    if (answer.files) {
      return {
        files: answer.files,
        formData: answer.formData || {},
        value: answer.value,
        optionId: answer.optionId,
        aiAnalysis: answer.aiAnalysis,
        _isStoredAnswer: true // Add flag for stored answers
      };
    }

    // Handle multiple choice answers
    if (answer.optionId) {
      return { 
        id: answer.optionId, 
        text: answer.value,
        _isStoredAnswer: true, // Add flag for stored answers
        buttonResponses: answer.buttonResponses || {},
        ...(answer.aiAnalysis && { aiAnalysis: answer.aiAnalysis }),
        ...(answer.files && { files: answer.files }),
        ...(answer.formData && { formData: answer.formData })
      };
    }

    // Handle text answers with AI analysis
    if (answer.aiAnalysis) {
      return {
        value: answer.value,
        aiAnalysis: answer.aiAnalysis,
        _isStoredAnswer: true, // Add flag for stored answers
        buttonResponses: answer.buttonResponses || {},
        ...(answer.files && { files: answer.files }),
        ...(answer.formData && { formData: answer.formData })
      };
    }

    // Handle simple text answers
    if (typeof answer.value === 'string') {
      return {
        value: answer.value,
        _isStoredAnswer: true // Add flag for stored answers
      };
    }

    return {
      ...answer,
      _isStoredAnswer: true // Add flag for stored answers
    };
  } catch (error) {
    console.error(`Error in getAnswer for question ${questionId}:`, error);
    return undefined;
  }
};


export const saveAnswer = async (
  questionId: number,
  answer: string | Option | { value: string, aiAnalysis?: string } | FileUploadAnswer,
  aiAnalysis?: string,
  updateAIOnly: boolean = false,
  branchContext?: BranchContext
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("User not authenticated");
    throw new Error("User not authenticated");
  }

  if (!questionId || !answer) {
    console.error("Missing required parameters: questionId or answer", { questionId, answer });
    throw new Error("Missing required parameters: questionId or answer");
  }

  try {
    console.log("saveAnswer called with:", {
      questionId,
      answer,
      aiAnalysis,
      updateAIOnly,
      branchContext,
    });

    // Prepare answer data
    let answerData;
    if (typeof answer === 'object' && answer !== null && 'files' in answer) {
      answerData = {
        files: answer.files.map((file, index) => ({
          ...file,
          formData: answer.formData?.[index] || file.formData || {},
        })),
        formData: answer.formData || {},
      };
    } else if (typeof answer === 'string' && answer.startsWith('{') && answer.endsWith('}')) {
      answerData = {
        value: answer,
      };
    } else if (typeof answer === 'object' && 'value' in answer) {
      answerData = {
        value: answer.value,
        aiAnalysis: answer.aiAnalysis || aiAnalysis,
      };
    } else {
      answerData = {
        value: typeof answer === 'string' ? answer : answer.text,
        optionId: typeof answer === 'string' ? null : answer.id,
        aiAnalysis: aiAnalysis,
      };
    }

    console.log("Prepared answer data:", answerData);

    // Fetch existing answer using getAnswer
    const existingAnswer = await getAnswer(user.id, questionId, branchContext);
    console.log("Existing answer fetched using getAnswer:", existingAnswer);

    if (existingAnswer) {
      console.log("Updating existing answer");
      let updateQuery = supabase
        .from('question_answers')
        .update({
          answer: answerData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (branchContext) {
        console.log("Branch context detected, adding to update query:", branchContext);
        updateQuery = updateQuery
          .eq('parent_repeater_id', branchContext.parentQuestionId)
          .eq('branch_entry_id', branchContext.entryId)
          .eq('branch_entry_index', branchContext.entryIndex);
      } else {
        console.log("No branch context, updating main question.");
        updateQuery = updateQuery
          .is('parent_repeater_id', null)
          .is('branch_entry_id', null);
      }

      const { error: updateError } = await updateQuery;

      if (updateError) {
        console.error("Error during update query:", { updateError, questionId, branchContext });
        throw updateError;
      }

      console.log("Answer updated successfully");
    } else {
      console.log("Inserting new answer for question:", questionId);
      const { error: insertError } = await supabase
        .from('question_answers')
        .insert({
          user_id: user.id,
          question_id: questionId,
          answer: answerData,
          parent_repeater_id: branchContext?.parentQuestionId || null,
          branch_entry_id: branchContext?.entryId || null,
          branch_entry_index: branchContext?.entryIndex || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error during insert query:", { insertError, questionId, branchContext });
        throw insertError;
      }

      console.log("Answer inserted successfully");
    }
  } catch (error) {
    console.error(`Error in saveAnswer for question ${questionId}:`, error);
    throw error;
  }
};

export const getBranchAnswers = async (
  userId: string,
  parentQuestionId: number,
  entryId: string,
  totalQuestions: number // Add this parameter
): Promise<{ answers: any[], hasStarted: boolean, isComplete: boolean }> => {
  try {
    const { data: answers, error } = await supabase
      .from('question_answers')
      .select('*')
      .eq('user_id', userId)
      .eq('parent_repeater_id', parentQuestionId)
      .eq('branch_entry_id', entryId);

    if (error) throw error;

    const hasAnswers = answers && answers.length > 0;
    const isComplete = answers && answers.length === totalQuestions;

    return {
      answers: answers || [],
      hasStarted: hasAnswers,
      isComplete // Now properly calculated
    };
  } catch (error) {
    console.error('Error getting branch answers:', error);
    return { answers: [], hasStarted: false, isComplete: false };
  }
};


