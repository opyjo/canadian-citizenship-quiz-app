import { QueryClient } from "@tanstack/react-query";

// Create query key factories for type safety and consistency
export const queryKeys = {
  all: ["questions"] as const,
  random: (count: number) => [...queryKeys.all, "random", count] as const,
  byIds: (ids: number[]) => [...queryKeys.all, "byIds", ...ids.sort()] as const,
  practice: (userId: string | null, count: number, incorrectOnly: boolean) =>
    [...queryKeys.all, "practice", userId, count, incorrectOnly] as const,
  quizAttempts: {
    all: ["quizAttempts"] as const,
    byUser: (userId: string) =>
      [...queryKeys.quizAttempts.all, "user", userId] as const,
    byId: (attemptId: string) =>
      [...queryKeys.quizAttempts.all, "byId", attemptId] as const,
  },
} as const;

// Create a new QueryClient instance
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache questions for 5 minutes by default (they rarely change)
        staleTime: 5 * 60 * 1000,
        // Keep in cache for 30 minutes
        gcTime: 30 * 60 * 1000,
        // Retry failed requests intelligently
        retry: (failureCount, error: any) => {
          // Don't retry on 404s or 403s (these are likely permanent)
          if (error?.status === 404 || error?.status === 403) {
            return false;
          }
          return failureCount < 3;
        },
        // Don't refetch on window focus by default (saves bandwidth)
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
}

// Export a shared instance for server components if needed
export const queryClient = createQueryClient();
