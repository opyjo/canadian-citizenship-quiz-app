import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import supabase from "@/lib/supabase-client";

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

// Hook for getting random questions (standard/timed quizzes)
export function useRandomQuestions(count: number = 20) {
  return useQuery({
    queryKey: queryKeys.random(count),
    queryFn: async (): Promise<Question[]> => {
      const { data, error } = await supabase.rpc(
        "get_random_questions" as any,
        {
          question_limit: count,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for random questions
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
  });
}

// Hook for getting questions by specific IDs (for results page)
export function useQuestionsByIds(ids: number[]) {
  return useQuery({
    queryKey: queryKeys.byIds(ids),
    queryFn: async (): Promise<Question[]> => {
      const { data, error } = await supabase
        .from("questions")
        .select(
          "id, question_text, option_a, option_b, option_c, option_d, correct_option"
        )
        .in("id", ids);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes for specific questions
    enabled: ids.length > 0, // Only run if we have IDs
  });
}

// Hook for practice questions with optional incorrect filter
export function usePracticeQuestions(
  userId: string | null,
  count: number,
  incorrectOnly: boolean = false
) {
  return useQuery({
    queryKey: queryKeys.practice(userId, count, incorrectOnly),
    queryFn: async (): Promise<Question[]> => {
      const { data, error } = await supabase.rpc(
        "get_random_practice_questions" as any,
        {
          user_id_param: userId,
          question_limit: count,
          incorrect_only: incorrectOnly,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for practice questions
    enabled: count > 0, // Only run if count is valid
  });
}
