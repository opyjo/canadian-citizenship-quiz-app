import { useQuery } from "@tanstack/react-query";

export type UseIncorrectQuestionsCountResult = {
  count: number;
  loading: boolean;
  error: string | null;
};

export const useIncorrectQuestionsCount = (
  user: { id: string } | null,
  initialized: boolean,
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
    enabled: initialized && !!user,
    select: (data) => data,
  });

  return {
    count,
    loading,
    error: error ? error.message : null,
  };
};
