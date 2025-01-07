// src/services/quiz.ts
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/quiz";

const QUESTIONS_TABLE = 'questions';

export const loadQuizState = async (): Promise<Question[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from(QUESTIONS_TABLE)
    .select('*')
    .order('question_order', { nullsLast: true });

  if (error) {
    console.error("Error loading questions:", error);
    return [];
  }

  // Map snake_case to camelCase
  return (data || []).map(question => ({
    id: question.id,
    question: question.question,
    type: question.type,
    options: question.options || [],
    defaultNextQuestionId: question.default_next_question_id,
    fileUploadMetadata: question.file_upload_metadata,
    aiLookup: question.ai_lookup,
    inputMetadata: question.input_metadata,
    repeaterConfig: question.repeater_config
  }));
};

export const saveQuizState = async (questions: Question[]): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    throw new Error("Only admins can modify questions");
  }

  // Update each question individually
  for (const question of questions) {
    const { error } = await supabase
      .from('questions')
      .upsert({
        id: question.id,
        question: question.question,
        type: question.type,
        options: question.options,
        default_next_question_id: question.defaultNextQuestionId,
        file_upload_metadata: question.fileUploadMetadata,
        ai_lookup: question.aiLookup,
        input_metadata: question.inputMetadata,
        repeater_config: question.repeaterConfig
      });

    if (error) throw error;
  }
};
