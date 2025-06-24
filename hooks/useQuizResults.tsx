// hooks/useQuizResults.ts - Clean, simple implementation

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useQuestionsByIds } from "@/hooks/useQuestions";
import supabaseClient from "@/lib/supabase-client";

interface QuizAttempt {
  id: number;
  user_answers: Record<string, string>;
  question_ids: number[];
  is_timed: boolean;
  time_taken_seconds: number | null;
  is_practice: boolean;
  practice_type: string | null;
  category?: string | null;
  created_at: string;
}

// Simple: Just fetch the attempt metadata
const fetchQuizAttempt = async (attemptId: string): Promise<QuizAttempt> => {
  const { data, error } = await supabaseClient
    .from("quiz_attempts")
    .select("*")
    .eq("id", parseInt(attemptId, 10))
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Quiz attempt not found.");

  return data as QuizAttempt;
};

export function useQuizResults(attemptId: string) {
  // Step 1: Get attempt metadata
  const {
    data: attempt,
    isLoading: isAttemptLoading,
    error: attemptError,
  } = useQuery({
    queryKey: ["quiz-attempt", attemptId],
    queryFn: () => fetchQuizAttempt(attemptId),
    enabled: !!attemptId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Step 2: Get questions using our reusable hook
  const {
    data: questions = [],
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = useQuestionsByIds(
    attempt?.question_ids ?? [],
    !!attempt?.question_ids // Only when we have IDs
  );

  // Unified loading and error handling
  const loading = isAttemptLoading ?? isQuestionsLoading;
  const error =
    attemptError || questionsError
      ? String(attemptError ?? questionsError)
      : null;

  // Extract data with defaults
  const userAnswers = attempt?.user_answers ?? {};
  const isTimed = attempt?.is_timed ?? false;
  const isPractice = attempt?.is_practice ?? false;
  const practiceType = attempt?.practice_type;
  const quizCategory = attempt?.category ?? null;
  const timeTaken = attempt?.time_taken_seconds;

  // Calculate results (memoized for performance)
  const calculatedValues = useMemo(() => {
    const correctAnswersCount = questions.filter(
      (q) => userAnswers[q.id]?.toUpperCase() === q.correct_option
    ).length;

    const totalQuestions = questions.length;
    const scorePercentage =
      totalQuestions > 0
        ? Math.round((correctAnswersCount / totalQuestions) * 100)
        : 0;
    const passed = !isPractice && correctAnswersCount >= 15;
    const formattedTimeTaken = timeTaken
      ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`
      : "Not recorded";

    return {
      correctAnswersCount,
      totalQuestions,
      scorePercentage,
      passed,
      formattedTimeTaken,
    };
  }, [questions, userAnswers, isPractice, timeTaken]);

  return {
    questions,
    userAnswers,
    loading,
    error,
    isTimed,
    timeTaken,
    isPractice,
    practiceType,
    quizCategory,
    ...calculatedValues,
  };
}
