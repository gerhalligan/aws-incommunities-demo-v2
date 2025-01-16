import { create } from "zustand"; 
import { supabase } from "@/integrations/supabase/client";

export interface Answer {
  id: string;
  user_id: string;
  question_id: number;
  answer: {
    value: string;
    optionId?: string;
    aiAnalysis?: {
      analysis: string;
      buttonResponses: {
        [key: string]: string;
      };
    };
    buttonResponses?: {};
  };
  created_at: string;
  updated_at: string;
  parent_repeater_id: number | null;
  branch_entry_id: string | null;
  branch_entry_index: number | null;
}

interface AnswersStore {
  answers: Answer[];
  setAnswers: (answers: Answer[]) => void;
  getAnswerByQuestionId: (questionId: number) => Answer | undefined;
  loadAnswers: () => Promise<void>;
}

export const useAnswersStore = create<AnswersStore>((set, get) => ({
  answers: [],
  setAnswers: (answers) => set({ answers }),
  getAnswerByQuestionId: (questionId) => {
    return get().answers.find(answer => answer.question_id === questionId);
  },
  loadAnswers: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found");
        return;
      }

      const { data, error } = await supabase
        .from('question_answers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching answers:", error);
        return;
      }

      set({ answers: data });
    } catch (error) {
      console.error('Error loading answers:', error);
    }
  }
}));