// src/hooks/useTimedQuiz.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useQuizStore } from "@/stores";
import { QuizMode } from "@/lib/quizlimits/constants";

const TIME_LIMIT = 15 * 60; // 15 minutes in seconds

export function useTimedQuiz() {
  const router = useRouter();
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
    timer,
    initializeQuiz,
    resetQuiz,
    submitQuiz,
    startTimer,
    stopTimer,
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
    quizType: "timed" as const,
  });

  // ============================================================================
  // Derived State
  // ============================================================================
  const isSubmitting = status === "submitting";
  const isQuizActive = status === "active" && questions.length > 0;
  const hasError = status === "error";
  const isCompleted = status === "completed";
  const isLoading = authLoading || status === "loading";

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!timer.startTime) return TIME_LIMIT;
    const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
    return Math.max(0, TIME_LIMIT - elapsed);
  }, [timer.startTime]);

  // Derive loading message
  const loadingMessage = useMemo(() => {
    if (authLoading) return "Authenticating...";
    if (status === "loading") return "Loading questions...";
    if (status === "submitting") return "Submitting results...";
    return null;
  }, [authLoading, status]);

  // Derive feedback message
  const feedbackMessage = useMemo(() => {
    if (hasError) return error || "An error occurred";
    if (status === "active" && questions.length === 0) {
      return "No questions available for this quiz.";
    }
    return null;
  }, [hasError, status, error, questions.length]);

  // ============================================================================
  // Initialize quiz when component mounts
  // ============================================================================
  useEffect(() => {
    if (authLoading) return;

    // Initialize timed quiz and start timer
    initializeQuiz("timed" as QuizMode);
    startTimer();

    // Cleanup on unmount
    return () => {
      stopTimer();
      resetQuiz();
    };
  }, [authLoading, initializeQuiz, resetQuiz, startTimer, stopTimer]);

  // ============================================================================
  // Handle Quiz completion
  // ============================================================================
  useEffect(() => {
    if (!isCompleted) return;

    if (attempt.id) {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        router.push(`/results/${attempt.id}`);
      }, 100);
      return () => clearTimeout(timer);
    } else if (attempt.score !== null) {
      // Unauthenticated user - show results modal
      setShowUnauthResults(true);
      setUnauthenticatedResults({
        quizType: "timed",
        score: attempt.score,
        totalQuestions: questions.length,
      });
    }
  }, [isCompleted, attempt.id, attempt.score, questions.length, router]);

  // ============================================================================
  // Auto-submit when time is up
  // ============================================================================
  useEffect(() => {
    if (timeRemaining <= 0 && isQuizActive) {
      stopTimer();
      submitQuiz();
    }
  }, [timeRemaining, isQuizActive, stopTimer, submitQuiz]);

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
    stopTimer();
    await submitQuiz();
  }, [stopTimer, submitQuiz]);

  const handleFinishQuiz = useCallback(async () => {
    stopTimer();
    await submitQuiz();
  }, [stopTimer, submitQuiz]);

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
    // State flags (flattened for consistency)
    isEndQuizModalOpen,
    timeRemaining,
    isSubmitting,
    isLoading,
    isQuizActive,
    showUnauthResults,
    hasError,

    // Messages
    loadingMessage,
    feedbackMessage,

    // Quiz data (renamed for consistency)
    quizData: {
      currentQuestion,
      selectedAnswers,
      currentQuestionIndex,
      progress,
      questions,
    },

    // Handlers (renamed for consistency)
    quizHandlers: {
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
    error,
  };
}
