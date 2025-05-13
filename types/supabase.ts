export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: number
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_option: string
          answer_explanation: string | null
          created_at: string
          category: string | null
          difficulty: string | null
        }
        Insert: {
          id?: number
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_option: string
          answer_explanation?: string | null
          created_at?: string
          category?: string | null
          difficulty?: string | null
        }
        Update: {
          id?: number
          question_text?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          correct_option?: string
          answer_explanation?: string | null
          created_at?: string
          category?: string | null
          difficulty?: string | null
        }
      }
      quiz_attempts: {
        Row: {
          id: number
          user_id: string
          score: number
          total_questions: number
          created_at: string
          time_taken: number | null
          is_timed: boolean
          quiz_type: string
          category: string | null
        }
        Insert: {
          id?: number
          user_id: string
          score: number
          total_questions: number
          created_at?: string
          time_taken?: number | null
          is_timed?: boolean
          quiz_type?: string
          category?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          score?: number
          total_questions?: number
          created_at?: string
          time_taken?: number | null
          is_timed?: boolean
          quiz_type?: string
          category?: string | null
        }
      }
      user_incorrect_questions: {
        Row: {
          id: number
          user_id: string
          question_id: number
          created_at: string
          times_incorrect: number
        }
        Insert: {
          id?: number
          user_id: string
          question_id: number
          created_at?: string
          times_incorrect?: number
        }
        Update: {
          id?: number
          user_id?: string
          question_id?: number
          created_at?: string
          times_incorrect?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
