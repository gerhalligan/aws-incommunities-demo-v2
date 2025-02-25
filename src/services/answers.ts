import { supabase } from "@/integrations/supabase/client";
import { Option, Question } from "@/types/quiz";
import type { BranchContext } from "@/types/answers";
import { FileMetadata, FileUploadAnswer } from "@/types/files";
import { Database } from "@/integrations/supabase/types";

type QuestionAnswerInsert = Database['public']['Tables']['question_answers']['Insert'];
type QuestionAnswerUpdate = Database['public']['Tables']['question_answers']['Update'];

interface StoredAnswer extends Option {
  value?: string;
  _isStoredAnswer?: boolean;
}

export const getAnswer = async (
  userId: string,
  questionId: number,
  branchContext?: BranchContext,
  applicationId: string
): Promise<string | Record<string, any> | undefined> => {
  if (!applicationId) {
    throw new Error("Application ID is required");
  }

  console.log('getAnswer called for:', { userId, questionId, branchContext, applicationId });

  // Fetch the question details
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (questionError) {
    console.error(`Error fetching question ${questionId}:`, questionError);
    return { question }; // Return question even if there's an error
  }

  if (!question) {
    console.error(`Question not found for ID: ${questionId}`);
    return { question }; // Return question even if not found
  }

  try {
    let baseQuery = supabase
      .from('question_answers')
      .select('*')
      .eq('user_id', userId) 
      .eq('question_id', questionId)
      .eq('application_id', applicationId);

    // Use the new branch columns if branchContext exists
    if (branchContext) {
      baseQuery = baseQuery
        .eq("parent_repeater_id", branchContext.parentQuestionId)
        .eq("branch_entry_id", branchContext.entryId)
        .eq("branch_entry_index", branchContext.entryIndex);
    } else {
      baseQuery = baseQuery
        .eq('branch_entry_index', -1); // main branch is always -1
    }

    // Add sorting and limit to get the earliest row
    baseQuery = baseQuery
      .order('created_at', { ascending: true })
      .limit(1);

    const result = await baseQuery.maybeSingle();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        console.log('No answer found');
        return { question }; // Return question even if no answer exists
      }
      console.error(`Error fetching answer for question ${questionId}:`, result.error);
      return { question }; // Return question in case of an error
    }

    if (!result.data) {
      return { question }; // Return question if no answer data is found
    }

    // Extract the answer
    const answer = result.data.answer as Record<string, any>;
    if (!answer) {
      console.error('Answer data is missing');
      return { question }; // Return question if answer is missing
    }

    // Base answer data to always include the question
    const answerData: Record<string, any> = {
      question, // Include question details
      _isStoredAnswer: true,
    };

    answerData.updated_at = result.data.updated_at;

    // Handle question type-specific logic
    switch (question.type) {
      case 'multiple-choice':
        if (answer.optionId) {
          answerData.id = answer.optionId;
          answerData.text = answer.value as string;
        }
        break;

      case 'input':
        answerData.id = `${questionId}-text`;
        answerData.text = answer.value as string;
        answerData.value = answer.value;
        break;

       case 'repeater':
        if (answer.value && typeof answer.value === 'string') {
          try {
            const parsedValue = JSON.parse(answer.value); // Parse the stringified JSON
            answerData.rawValue = parsedValue;
          } catch (parseError) {
            console.error('Error parsing repeater value:', parseError);
            throw new Error('Invalid format for repeater answer');
          }
        }
        break;

      default:
        console.warn(`Unhandled question type: ${question.type}`);
        break;
    }

    // Include files if they exist and file upload is enabled for the question
    if (question.file_upload_metadata?.enabled && answer?.files) {
      answerData.files = answer.files.map((file) => ({
        ...file,
        formData: file.formData || {}, // Ensure formData exists
      }));
      answerData.formData = answer.formData || {}; // Include formData if provided
    }

    // Include AI analysis if enabled
    if (question.ai_lookup?.enabled) {
      answerData.aiAnalysis = {
        analysis:
          typeof answer.aiAnalysis === 'object' && answer.aiAnalysis.analysis
            ? answer.aiAnalysis.analysis
            : typeof answer.aiAnalysis === 'string'
            ? answer.aiAnalysis
            : '',
        lastUpdated: answer.aiAnalysis?.lastUpdated,
        buttonResponses:
          typeof answer.aiAnalysis === 'object' && answer.aiAnalysis.buttonResponses
            ? answer.aiAnalysis.buttonResponses
            : {},
      };
    }

    // Return the complete answer data with question details
    return answerData;
  } catch (error) {
    console.error(`Error in getAnswer for question ${questionId}:`, error);
    return { question }; // Return question in case of any error
  }
};

export const saveAnswer = async (
  questionId: number,
  answer: string | Option | { value: string; aiAnalysis?: { analysis?: string; buttonResponses?: Record<string, string> } } | FileUploadAnswer,
  aiAnalysis?: string,
  updateAIOnly: boolean = false,
  branchContext?: BranchContext,
  applicationId?: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("User not authenticated");
    throw new Error("User not authenticated");
  }

  // Get or create application ID
  if (!applicationId) {
    throw new Error("Application ID is required");
  }
  if (!questionId || !answer) {
    console.error("Missing required parameters: questionId or answer", { questionId, answer });
    throw new Error("Missing required parameters: questionId or answer");
  }

  try {
    console.log('Saving answer with application ID:', applicationId);
    console.log("saveAnswer called with:", { questionId, answer, aiAnalysis, updateAIOnly, branchContext });

    // Fetch existing answer and its question details
    const answerObject = await getAnswer(user.id, questionId, branchContext, applicationId);
    const question = answerObject?.question;
    let existingAnswer = null; // Initialize with null
    
    if(answerObject._isStoredAnswer){
      existingAnswer = answerObject;
    }

    if (!question) {
      console.error(`Question not found in existing answer for ID: ${questionId}`);
      throw new Error(`Question not found in existing answer for ID: ${questionId}`);
    }

    let answerData: Record<string, any> = {};

    // Use question type to determine how to handle the answer
    switch (question.type) {
      case "multiple-choice":
        if (typeof answer === "object" && "id" in answer && "text" in answer) {
          // Multiple-choice answer
          answerData = {
            optionId: answer.id,
            value: answer.text,
          };
        } else {
          console.error("Unexpected answer format for multiple-choice:", answer);
          throw new Error("Unexpected answer format for multiple-choice");
        }
        break;

      case "input":
        if (typeof answer === "string" || (typeof answer === "object" && "value" in answer)) {
          // Input text answer
          answerData = {
            value: typeof answer === "string" ? answer : answer.value,
          };
        } else {
          console.error("Unexpected answer format for input:", answer);
          throw new Error("Unexpected answer format for input");
        }
        break;

      case "repeater":
        if (answer.value && typeof answer.value === "object" && Array.isArray(answer.value.entries)) {
          // Handle the new repeater object format
          answerData = {
            value: JSON.stringify(answer.value), 
          };
        } 
        else if (answer.entries && typeof answer.entries === "object" && Array.isArray(answer.entries)) {
          // Handle the new repeater object format
          answerData = {
            value: JSON.stringify(answer.entries), 
          };
        } 
        else if(typeof answer === "string" || (typeof answer === "object" && "value" in answer)) {
          answerData = {
            value: typeof answer === "string" ? answer : answer.value,
          };
        }
        else {
          console.error("Unexpected answer format for repeater:", answer);
          throw new Error("Unexpected answer format for repeater. Expected an object with entries array.");
        }
        break;

      default:
        console.error("Unsupported question type:", question.type);
        throw new Error(`Unsupported question type: ${question.type}`);
    }

    // Include files if present
    if (typeof answer === "object" && answer !== null && "files" in answer) {
      answerData.files = answer.files.map((file, index) => ({
        ...file,
        formData: answer.formData?.[index] || file.formData || {},
      }));
      answerData.formData = answer.formData || {};
    }

    // Include AI analysis only if ai_enabled is true in the question
    if (question.ai_lookup?.enabled) {
      answerData.aiAnalysis = {
        analysis: aiAnalysis || existingAnswer?.aiAnalysis?.analysis || "",
        buttonResponses: {
          ...(existingAnswer?.aiAnalysis?.buttonResponses || {}),
          ...(answer.aiAnalysis?.buttonResponses || {}),       
        },
        lastUpdated: answer.aiAnalysis?.lastUpdated,
      };
    }

    console.log("Prepared answer data:", answerData);

    if (existingAnswer) {
      console.log("Updating existing answer");
      let updateQuery = supabase
        .from("question_answers")
        .update({
          answer: answerData,
          updated_at: new Date().toISOString(),
        } satisfies QuestionAnswerUpdate)
        .eq("user_id", user.id)
        .eq("question_id", questionId)
        .eq('application_id', applicationId);

      if (branchContext) {
        updateQuery = updateQuery
          .eq("parent_repeater_id", branchContext.parentQuestionId)
          .eq("branch_entry_id", branchContext.entryId)
          .eq("branch_entry_index", branchContext.entryIndex);
      } else {
        updateQuery = updateQuery
          .eq("branch_entry_index", -1);
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
        .from("question_answers")
        .insert({
          application_id: applicationId,
          user_id: user.id,
          question_id: questionId,
          answer: answerData,
          parent_repeater_id: branchContext?.parentQuestionId || null,
          branch_entry_id: branchContext?.entryId || null,
          branch_entry_index: branchContext?.entryIndex || -1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } satisfies QuestionAnswerInsert);

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