import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore, useQuizStore } from "@/stores";
import { usePracticeParams } from "./usePracticeParams";
import { UnauthenticatedResults } from "../app/utils/types";
import { checkQuizAccess } from "@/app/actions/check-quiz-access";
import { QuizMode } from "@/stores/quiz/types";
import { checkUnauthenticatedUserLimits } from "@/lib/quizlimits/helpers";

export function usePracticeQuiz() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { practiceType } = usePracticeParams(searchParams);
  const mode = (practiceType || "random") as QuizMode;

  // Auth state
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);

  // Quiz Access State
  const [canAttempt, setCanAttempt] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");
  const [isCheckingLimits, setIsCheckingLimits] = useState(true);

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
  const [showUnauthResults, setShowUnauthResults] = useState(false);
  const [unauthenticatedResults, setUnauthenticatedResults] =
    useState<UnauthenticatedResults>({
      score: null,
      totalQuestions: null,
      quizType: "practice",
    });

  // ============================================================================
  // Derived State
  // ============================================================================
  const isSubmitting = status === "submitting";
  const isQuizActive = status === "active" && questions.length > 0;
  const hasError = status === "error";
  const isCompleted = status === "completed";

  // Comprehensive loading state that prevents flicker
  const isLoading = useMemo(() => {
    return (
      status === "loading" ||
      status === "submitting" ||
      (status === "completed" && !showUnauthResults) || // Prevents flicker during navigation
      authLoading ||
      isCheckingLimits
    );
  }, [status, showUnauthResults, authLoading, isCheckingLimits]);

  // Derive loading message
  const loadingMessage = useMemo(() => {
    if (authLoading || isCheckingLimits) return "Checking access...";
    if (status === "loading") return "Loading questions...";
    if (status === "submitting") return "Submitting results...";
    if (status === "completed" && !showUnauthResults)
      return "Loading results...";
    return null;
  }, [authLoading, isCheckingLimits, status, showUnauthResults]);

  // Derive feedback message
  const feedbackMessage = useMemo(() => {
    if (!canAttempt) {
      return limitMessage;
    }
    if (hasError) return error || "An error occurred";
    if (status === "active" && questions.length === 0) {
      return mode === "incorrect"
        ? "Congratulations! No incorrect questions left."
        : "No questions available, please try again later.";
    }
    return null;
  }, [
    canAttempt,
    limitMessage,
    hasError,
    status,
    error,
    questions.length,
    mode,
  ]);

  // ============================================================================
  // Quiz Access Check
  // ============================================================================
  useEffect(() => {
    const checkQuizAccessStatus = async () => {
      setIsCheckingLimits(true);
      try {
        const result = user
          ? await checkQuizAccess("practice")
          : await checkUnauthenticatedUserLimits("practice");

        setCanAttempt(result.canAttempt);
        if (!result.canAttempt) {
          setLimitMessage(result.message);
        }
      } catch (error) {
        setCanAttempt(false);
        setLimitMessage("An error occurred while checking quiz access");
      } finally {
        setIsCheckingLimits(false);
      }
    };

    if (!authLoading) {
      checkQuizAccessStatus();
    }
  }, [user, authLoading]);

  // ============================================================================
  // Initialize quiz when component mounts
  // ============================================================================
  useEffect(() => {
    if (authLoading || isCheckingLimits) return;

    if (!canAttempt) return;

    // Reset and initialize
    resetQuiz();
    const timer = setTimeout(() => {
      initializeQuiz(mode, {
        questionsPerQuiz: Number(searchParams.get("count")) || 10,
      });
    }, 50); // Small delay to ensure reset is processed

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      resetQuiz();
    };
  }, [
    mode,
    canAttempt,
    authLoading,
    isCheckingLimits,
    initializeQuiz,
    resetQuiz,
    searchParams,
  ]);

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
        quizType: "practice",
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

  const handleFinishQuiz = useCallback(async () => {
    await submitQuiz();
  }, [submitQuiz]);

  const handleCloseResults = useCallback(() => {
    setShowUnauthResults(false);
    resetQuiz();
    // Optionally redirect back to practice selection
    router.push("/practice");
  }, [resetQuiz, router]);

  // ============================================================================
  // Return Values
  // ============================================================================
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (questions.length || 1)) * 100;

  return {
    // State flags
    isLoading, // This now prevents flicker
    isSubmitting,
    isQuizActive,
    showUnauthResults,
    hasError,

    // Messages
    loadingMessage,
    feedbackMessage,

    // Quiz data
    quizData: {
      currentQuestion,
      selectedAnswers,
      currentQuestionIndex,
      progress,
      practiceType: mode,
      questions,
    },

    // Handlers
    quizHandlers: {
      selectAnswer,
      previousQuestion,
      nextQuestion,
      finishQuiz: handleFinishQuiz,
    },

    // Results
    unauthenticatedResults,
    handleCloseResults,

    // Auth/limits
    isAuthenticated: !!user,
    canAttempt,
    limitMessage,
    error,
  };
}
