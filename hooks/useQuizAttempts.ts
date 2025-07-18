import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import supabase from "@/lib/supabase-client";

export interface QuizAttempt {
  id: number;
  user_id: string | null;
  score: number | null;
  total_questions_in_attempt: number | null;
  created_at: string | null;
  time_taken_seconds: number | null;
  is_timed: boolean | null;
  quiz_type: string | null;
  is_practice: boolean | null;
  practice_type: string | null;
  question_ids: number[] | null;
  user_answers: any | null;
}

// Hook for getting user's quiz attempts
export function useQuizAttempts(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.quizAttempts.byUser(userId || ""),
    queryFn: async (): Promise<QuizAttempt[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for quiz attempts
    enabled: !!userId, // Only run if user is logged in
  });
}

// Hook for getting a specific quiz attempt
export function useQuizAttempt(attemptId: string) {
  return useQuery({
    queryKey: queryKeys.quizAttempts.byId(attemptId),
    queryFn: async (): Promise<QuizAttempt | null> => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("id", parseInt(attemptId))
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw new Error(error.message);
      }

      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes for specific attempts
    enabled: !!attemptId, // Only run if attemptId is provided
  });
}

// Hook for creating quiz attempts with optimistic updates
export function useCreateQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attemptData: Partial<QuizAttempt>) => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert(attemptData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (newAttempt) => {
      // Invalidate and refetch quiz attempts for this user
      if (newAttempt.user_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.quizAttempts.byUser(newAttempt.user_id),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to create quiz attempt:", error);
    },
  });
}
