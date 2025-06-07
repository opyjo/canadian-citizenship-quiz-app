export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          access_level: string | null;
          active_monthly_plan_price_id: string | null;
          active_stripe_subscription_id: string | null;
          cancel_at_period_end: boolean | null;
          created_at: string;
          id: string;
          purchased_lifetime_price_id: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_status: string | null;
          subscription_current_period_end: string | null;
          updated_at: string;
        };
        Insert: {
          access_level?: string | null;
          active_monthly_plan_price_id?: string | null;
          active_stripe_subscription_id?: string | null;
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          id: string;
          purchased_lifetime_price_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_status?: string | null;
          subscription_current_period_end?: string | null;
          updated_at?: string;
        };
        Update: {
          access_level?: string | null;
          active_monthly_plan_price_id?: string | null;
          active_stripe_subscription_id?: string | null;
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          id?: string;
          purchased_lifetime_price_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_status?: string | null;
          subscription_current_period_end?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          correct_option: string;
          id: number;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          question_text: string;
        };
        Insert: {
          correct_option: string;
          id?: number;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          question_text: string;
        };
        Update: {
          correct_option?: string;
          id?: number;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          question_text?: string;
        };
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          created_at: string | null;
          id: number;
          is_practice: boolean | null;
          is_timed: boolean | null;
          practice_type: string | null;
          question_ids: number[] | null;
          quiz_type: string | null;
          score: number | null;
          time_taken_seconds: number | null;
          total_questions_in_attempt: number | null;
          user_answers: Json | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          is_practice?: boolean | null;
          is_timed?: boolean | null;
          practice_type?: string | null;
          question_ids?: number[] | null;
          quiz_type?: string | null;
          score?: number | null;
          time_taken_seconds?: number | null;
          total_questions_in_attempt?: number | null;
          user_answers?: Json | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          is_practice?: boolean | null;
          is_timed?: boolean | null;
          practice_type?: string | null;
          question_ids?: number[] | null;
          quiz_type?: string | null;
          score?: number | null;
          time_taken_seconds?: number | null;
          total_questions_in_attempt?: number | null;
          user_answers?: Json | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_user_id_fkey1";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_freemium_quiz_counts: {
        Row: {
          count: number;
          last_attempted: string | null;
          mode: string;
          user_id: string;
        };
        Insert: {
          count?: number;
          last_attempted?: string | null;
          mode: string;
          user_id: string;
        };
        Update: {
          count?: number;
          last_attempted?: string | null;
          mode?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_freemium_quiz_counts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_incorrect_questions: {
        Row: {
          created_at: string;
          question_id: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          question_id: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          question_id?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_incorrect_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_user_quiz_mode_attempts: {
        Args: { p_user_id: string; p_quiz_mode: string };
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
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
