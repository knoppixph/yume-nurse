export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "student" | "admin";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          display_name: string | null;
          email: string | null;
          year_level: string | null;
          school: string | null;
          profile_picture_url: string | null;
          study_goal: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          display_name?: string | null;
          email?: string | null;
          year_level?: string | null;
          school?: string | null;
          profile_picture_url?: string | null;
          study_goal?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          display_name?: string | null;
          email?: string | null;
          year_level?: string | null;
          school?: string | null;
          profile_picture_url?: string | null;
          study_goal?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          theme: "light" | "dark" | "system";
          daily_goal_questions: number;
          daily_goal_minutes: number;
          study_minutes: number;
          break_minutes: number;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: "light" | "dark" | "system";
          daily_goal_questions?: number;
          daily_goal_minutes?: number;
          study_minutes?: number;
          break_minutes?: number;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          theme?: "light" | "dark" | "system";
          daily_goal_questions?: number;
          daily_goal_minutes?: number;
          study_minutes?: number;
          break_minutes?: number;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      subject_accent: "pink" | "purple" | "blue" | "teal" | "amber" | "rose";
      content_difficulty: "easy" | "medium" | "hard";
      question_type:
        | "multiple_choice"
        | "true_false"
        | "select_all_that_apply"
        | "identification"
        | "prioritization"
        | "patient_scenario";
      flashcard_due_label: "due_now" | "today" | "tomorrow" | "later";
      flashcard_review_rating: "again" | "hard" | "good" | "easy";
      study_activity_type: "flashcards" | "quiz" | "review" | "materials" | "ai" | "timer" | "other";
      study_material_visibility: "private" | "admin_library" | "public";
      ai_generation_type: "chat" | "summary" | "flashcards" | "quiz_questions" | "key_terms" | "other";
      ai_generation_status: "pending" | "completed" | "failed";
      favorite_target_type: "subject" | "topic" | "flashcard" | "question";
    };
    CompositeTypes: Record<string, never>;
  };
};
