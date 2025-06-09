import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";

export const invalidateQuizAttempts = (
  queryClient: QueryClient,
  userId: string | null
) => {
  if (!userId) return;
  queryClient.invalidateQueries({
    queryKey: queryKeys.quizAttempts.byUser(userId),
  });
};
