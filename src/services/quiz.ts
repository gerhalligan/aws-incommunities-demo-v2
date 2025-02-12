import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/quiz";
import { toast } from "@/hooks/use-toast";

// Constants
const QUESTIONS_TABLE = 'questions';

const loadQuizState = async (): Promise<Question[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to continue",
      variant: "destructive"
    });
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from(QUESTIONS_TABLE)
    .select('*')
    .order('question_order', { nullsLast: true });

  if (error) {
    console.error("Error loading questions:", error);
    toast({
      title: "Error",
      description: "Failed to load questions. Please try again later.",
      variant: "destructive"
    });
    return [];
  }

  // Map snake_case to camelCase
  return (data || []).map(question => ({
    id: question.id,
    question: question.question,
    type: question.type,
    dependsOn: question.depends_on,
    options: question.options || [],
    defaultNextQuestionId: question.default_next_question_id,
    fileUploadMetadata: question.file_upload_metadata,
    aiLookup: question.ai_lookup,
    inputMetadata: question.input_metadata,
    repeaterConfig: question.repeater_config
  }));
};

const saveQuizState = async (questions: Question[]): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to continue",
      variant: "destructive"
    });
    throw new Error("User not authenticated");
  }

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    toast({
      title: "Permission Denied",
      description: "You don't have permission to modify questions. Please contact an administrator.",
      variant: "destructive"
    });
    throw new Error("Insufficient permissions");
  }

  // Update each question individually
  for (const question of questions) {
    const { error } = await supabase
      .from('questions')
      .upsert({
        id: question.id,
        question: question.question,
        type: question.type,
        depends_on: question.dependsOn,
        options: question.options,
        default_next_question_id: question.defaultNextQuestionId,
        file_upload_metadata: question.fileUploadMetadata,
        ai_lookup: question.aiLookup,
        input_metadata: question.inputMetadata,
        repeater_config: question.repeaterConfig
      });

    if (error) {
      console.error("Error saving question:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again later.",
        variant: "destructive"
      });
      throw error;
    }
  }
  
  toast({
    title: "Success",
    description: "Changes saved successfully"
  });
};


export { loadQuizState, saveQuizState }