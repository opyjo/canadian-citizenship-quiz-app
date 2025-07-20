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
  score?: number;
  total_questions_in_attempt?: number;
}

// Fast query: Just get the score data to fix race condition
const fetchQuizScore = async (attemptId: string) => {
  const { data, error } = await supabaseClient
    .from("quiz_attempts")
    .select("score, total_questions_in_attempt")
    .eq("id", parseInt(attemptId, 10))
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Quiz attempt not found.");

  return data;
};

// Full query: Get all attempt metadata
const fetchQuizAttempt = async (attemptId: string): Promise<QuizAttempt> => {
  const { data, error } = await supabaseClient
    .from("quiz_attempts")
    .select(
      "id, user_answers, question_ids, is_timed, time_taken_seconds, is_practice, practice_type, created_at, score, total_questions_in_attempt"
    )
    .eq("id", parseInt(attemptId, 10))
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Quiz attempt not found.");

  return data as QuizAttempt;
};

export function useQuizResults(attemptId: string) {
  // Step 1: Fast query - Get just the score to fix race condition
  const {
    data: scoreData,
    isLoading: isScoreLoading,
    error: scoreError,
  } = useQuery({
    queryKey: ["quiz-score", attemptId],
    queryFn: () => fetchQuizScore(attemptId),
    enabled: !!attemptId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Step 2: Full query - Get all attempt metadata
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

  // Step 3: Get questions using our reusable hook
  const {
    data: questions = [],
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = useQuestionsByIds(
    attempt?.question_ids ?? [],
    !!attempt?.question_ids // Only when we have IDs
  );

  // Unified loading and error handling
  // Score loading is prioritized to fix race condition
  const loading = isScoreLoading || isAttemptLoading || isQuestionsLoading;
  const error =
    scoreError || attemptError || questionsError
      ? String(scoreError ?? attemptError ?? questionsError)
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
    // Use the fast query score data first to avoid race conditions
    const correctAnswersCount = scoreData?.score ?? attempt?.score ?? 0;
    const totalQuestions =
      scoreData?.total_questions_in_attempt ??
      attempt?.total_questions_in_attempt ??
      questions.length;

    // Only recalculate if we don't have the stored values and questions are loaded
    const shouldRecalculate =
      !scoreData?.score && !attempt?.score && questions.length > 0;
    const recalculatedCorrectAnswers = shouldRecalculate
      ? questions.filter(
          (q) => userAnswers[q.id]?.toUpperCase() === q.correct_option
        ).length
      : correctAnswersCount;

    const finalCorrectAnswers = shouldRecalculate
      ? recalculatedCorrectAnswers
      : correctAnswersCount;
    const finalTotalQuestions = totalQuestions || questions.length;

    const scorePercentage =
      finalTotalQuestions > 0
        ? Math.round((finalCorrectAnswers / finalTotalQuestions) * 100)
        : 0;
    const passed = !isPractice && finalCorrectAnswers >= 15;
    const formattedTimeTaken = timeTaken
      ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`
      : "Not recorded";

    return {
      correctAnswersCount: finalCorrectAnswers,
      totalQuestions: finalTotalQuestions,
      scorePercentage,
      passed,
      formattedTimeTaken,
    };
  }, [
    scoreData?.score,
    scoreData?.total_questions_in_attempt,
    attempt?.score,
    attempt?.total_questions_in_attempt,
    questions,
    userAnswers,
    isPractice,
    timeTaken,
  ]);

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
