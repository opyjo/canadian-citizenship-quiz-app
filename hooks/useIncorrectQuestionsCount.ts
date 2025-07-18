import { useQuery } from "@tanstack/react-query";

export type UseIncorrectQuestionsCountResult = {
  count: number;
  loading: boolean;
  error: string | null;
};

export const useIncorrectQuestionsCount = (
  user: { id: string } | null,
  authLoading: boolean,
  supabase: any
): UseIncorrectQuestionsCountResult => {
  const {
    data: count = 0,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["incorrectQuestionsCount", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data: incorrectData, error: incorrectError } = await supabase
        .from("user_incorrect_questions")
        .select("question_id", { count: "exact" })
        .eq("user_id", user.id);
      if (incorrectError) throw incorrectError;
      return incorrectData?.length ?? 0;
    },
    enabled: !!user,
    staleTime: 0, // Data is considered stale immediately
    refetchOnMount: "always", // Always refetch when component mounts
  });

  return {
    count,
    loading,
    error: error ? error.message : null,
  };
};
