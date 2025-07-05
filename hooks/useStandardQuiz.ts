// src/hooks/useStandardQuiz.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useQuizStore } from "@/stores";
import { useAttemptLimit } from "./useAttemptLimit";
import { QuizMode } from "@/stores/quiz/types";

export function useStandardQuiz() {
  const router = useRouter();
  const {
    canAttempt,
    isLoading: isCheckingLimits,
    message,
  } = useAttemptLimit("standard");

  // Auth state
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);

  // Quiz state - destructure all needed values
  const {
    status,
    error,
    questions,
    currentQuestionIndex,
    selectedAnswers,
    attempt,
    initializeQuiz,
    resetQuiz,
    submitQuiz,
    selectAnswer: selectAnswerStore,
    nextQuestion,
    previousQuestion,
  } = useQuizStore();

  // Local UI state - only what can't be derived
  const [isEndQuizModalOpen, setIsEndQuizModalOpen] = useState(false);
  const [showUnauthResults, setShowUnauthResults] = useState(false);
  const [unauthenticatedResults, setUnauthenticatedResults] = useState({
    score: null as number | null,
    totalQuestions: null as number | null,
    quizType: "standard" as const,
  });

  // ============================================================================
  // Derived State
  // ============================================================================
  const isLoading = status === "loading" || authLoading || isCheckingLimits;
  const isSubmitting = status === "submitting";
  const isQuizActive = status === "active" && questions.length > 0;
  const hasError = status === "error";
  const isCompleted = status === "completed";

  // Derive loading message
  const loadingMessage = useMemo(() => {
    if (authLoading || isCheckingLimits) return "Checking access...";
    if (status === "loading") return "Loading questions...";
    if (status === "submitting") return "Submitting results...";
    return null;
  }, [authLoading, isCheckingLimits, status]);

  // Derive feedback message
  const feedbackMessage = useMemo(() => {
    if (!canAttempt) return message;
    if (hasError) return error || "An error occurred";
    if (status === "active" && questions.length === 0) {
      return "No questions available for this quiz.";
    }
    return null;
  }, [canAttempt, message, hasError, status, error, questions.length]);

  // ============================================================================
  // Initialize quiz when component mounts
  // ============================================================================
  useEffect(() => {
    if (authLoading || isCheckingLimits) return;

    if (!canAttempt) {
      resetQuiz();
      return;
    }

    // Initialize standard quiz
    initializeQuiz("standard" as QuizMode);

    // Cleanup on unmount
    return () => {
      resetQuiz();
    };
  }, [authLoading, isCheckingLimits, canAttempt, initializeQuiz, resetQuiz]);

  // ============================================================================
  // Handle Quiz completion
  // ============================================================================
  useEffect(() => {
    if (!isCompleted) return;

    if (attempt.id) {
      // Authenticated user - redirect to results page
      router.push(`/results/${attempt.id}`);
    } else if (attempt.score !== null) {
      // Unauthenticated user - show results modal
      setShowUnauthResults(true);
      setUnauthenticatedResults({
        quizType: "standard",
        score: attempt.score,
        totalQuestions: questions.length,
      });
    }
  }, [isCompleted, attempt.id, attempt.score, questions.length, router]);

  // ============================================================================
  // Quiz Control Functions
  // ============================================================================
  const selectAnswer = useCallback(
    (answer: string) => {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion) {
        selectAnswerStore(currentQuestion.id, answer);
      }
    },
    [currentQuestionIndex, questions, selectAnswerStore]
  );

  const handleEndQuiz = useCallback(() => {
    setIsEndQuizModalOpen(true);
  }, []);

  const handleCloseEndQuizModal = useCallback(() => {
    setIsEndQuizModalOpen(false);
  }, []);

  const handleConfirmEndQuiz = useCallback(async () => {
    setIsEndQuizModalOpen(false);
    await submitQuiz();
  }, [submitQuiz]);

  const handleFinishQuiz = useCallback(async () => {
    await submitQuiz();
  }, [submitQuiz]);

  const handleCloseResults = useCallback(() => {
    setShowUnauthResults(false);
    resetQuiz();
    // Redirect to home or quiz selection
    router.push("/");
  }, [resetQuiz, router]);

  // ============================================================================
  // Return Values
  // ============================================================================
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (questions.length || 1)) * 100;

  return {
    // State flags
    isLoading,
    isSubmitting,
    isQuizActive,
    showUnauthResults,
    hasError,
    isEndQuizModalOpen,

    // Messages
    loadingMessage,
    feedbackMessage,

    // Quiz data
    quiz: {
      currentQuestion,
      selectedAnswers,
      currentQuestionIndex,
      progress,
      questions,
    },

    // Handlers
    handlers: {
      selectAnswer,
      previousQuestion,
      nextQuestion,
      handleEndQuiz,
      handleCloseEndQuizModal,
      handleConfirmEndQuiz,
      finishQuiz: handleFinishQuiz,
    },

    // Results
    unauthenticatedResults,
    handleCloseResults,

    // Auth/limits
    isAuthenticated: !!user,
    canAttempt,
    limitMessage: message,
    error,
  };
}
