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

// For practice quizzes - can use cached questions
export function useRandomQuestions(enabled: boolean, count: number = 20) {
  return useQuery({
    queryKey: ["questions", "random", count],
    queryFn: async (): Promise<Question[]> => {
      const { data, error } = await supabase.rpc(
        "get_random_questions" as any,
        { question_limit: count }
      );

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
    enabled, // Only fetch when access is checked
    staleTime: Infinity, // Never refetch
    gcTime: 0, // Don't keep in cache
  });
}

// Hook for practice questions with optional incorrect filter
export function usePracticeQuestions(
  userId: string | null,
  count: number,
  incorrectOnly: boolean = false,
  enabled: boolean = true,
  options?: { staleTime?: number; refetchOnMount?: boolean }
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

      return data ?? [];
    },
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes for practice questions by default
    enabled: enabled && count > 0, // Only run if count is valid and hook is enabled
    refetchOnMount: options?.refetchOnMount ?? false,
  });
}

// ADD ONLY THIS ONE HOOK:
export function useQuestionsByIds(
  questionIds: number[],
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["questions", "by-ids", questionIds.sort().join(",")],
    queryFn: async (): Promise<Question[]> => {
      if (!questionIds || questionIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from("questions")
        .select(
          "id, question_text, option_a, option_b, option_c, option_d, correct_option"
        )
        .in("id", questionIds);

      if (error) throw new Error(error.message);
      if (!data) throw new Error("Questions not found");

      // Maintain order from questionIds array
      const questionMap = new Map(data.map((q: Question) => [q.id, q]));
      return questionIds
        .map((id) => questionMap.get(id))
        .filter(Boolean) as Question[];
    },
    enabled: enabled && questionIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
