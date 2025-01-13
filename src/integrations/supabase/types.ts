export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: string;
          created_at: string | null;
          updated_at: string | null;
          display_name: string | null;
          phone_number: string | null;
          last_login: string | null;
        };
        Insert: {
          id: string;
          role?: string;
          created_at?: string | null;
          updated_at?: string | null;
          display_name?: string | null;
          phone_number?: string | null;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          role?: string;
          created_at?: string | null;
          updated_at?: string | null;
          display_name?: string | null;
          phone_number?: string | null;
          last_login?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      question_answers: {
        Row: {
          id: string;
          user_id: string;
          question_id: number;
          answer: Json;
          created_at: string | null;
          updated_at: string | null;
          parent_repeater_id: number | null;
          branch_entry_id: string | null;
          branch_entry_index: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: number;
          answer: Json;
          created_at?: string | null;
          updated_at?: string | null;
          parent_repeater_id?: number | null;
          branch_entry_id?: string | null;
          branch_entry_index?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: number;
          answer?: Json;
          created_at?: string | null;
          updated_at?: string | null;
          parent_repeater_id?: number | null;
          branch_entry_id?: string | null;
          branch_entry_index?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "question_answers_parent_repeater_id_fkey";
            columns: ["parent_repeater_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_answers_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      question_dependencies: {
        Row: {
          id: string;
          question_id: number | null;
          dependent_question_id: number | null;
          dependent_options: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          question_id?: number | null;
          dependent_question_id?: number | null;
          dependent_options?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          question_id?: number | null;
          dependent_question_id?: number | null;
          dependent_options?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "question_dependencies_dependent_question_id_fkey";
            columns: ["dependent_question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_dependencies_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          }
        ];
      };
      questions: {
        Row: {
          id: number;
          question: string;
          type: string;
          default_next_question_id: number | null;
          input_metadata: Json | null;
          file_upload_metadata: Json | null;
          ai_lookup: Json | null;
          created_at: string | null;
          updated_at: string | null;
          options: Json;
          repeater_config: Json | null;
          question_order: number;
        };
        Insert: {
          id: number;
          question: string;
          type: string;
          default_next_question_id?: number | null;
          input_metadata?: Json | null;
          file_upload_metadata?: Json | null;
          ai_lookup?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          options?: Json;
          repeater_config?: Json | null;
          question_order?: number;
        };
        Update: {
          id?: number;
          question?: string;
          type?: string;
          default_next_question_id?: number | null;
          input_metadata?: Json | null;
          file_upload_metadata?: Json | null;
          ai_lookup?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          options?: Json;
          repeater_config?: Json | null;
          question_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "questions_default_next_question_id_fkey";
            columns: ["default_next_question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          }
        ];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          settings: Json;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          settings?: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          settings?: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_question: {
        Args: {
          question_id: number;
        };
        Returns: undefined;
      };
      get_auth_users: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          email: string;
          created_at: string;
          email_confirmed_at: string | null;
          phone: string | null;
          confirmed_at: string | null;
          last_sign_in_at: string | null;
          role: string;
        }[];
      };
      get_current_user: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          email: string;
          created_at: string;
          email_confirmed_at: string | null;
          phone: string | null;
          confirmed_at: string | null;
          last_sign_in_at: string | null;
        }[];
      };
      get_current_user_profile: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          role: string;
          display_name: string | null;
          phone_number: string | null;
          last_login: string | null;
          created_at: string | null;
          updated_at: string | null;
        }[];
      };
      update_question_order: {
        Args: {
          question_id: number;
          new_order: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}