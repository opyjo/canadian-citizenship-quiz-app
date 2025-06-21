// src/hooks/useTimedQuiz.ts
import { useReducer, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useRandomQuestions } from "./useQuestions";
import { invalidateQuizAttempts } from "@/lib/utils/queryCacheUtils";
import { uiReducer, initialUIState } from "@/app/utils/reducers/uiReducer";
import type { Question, UnauthenticatedResults } from "@/app/utils/types";
import { useAttemptLimit } from "@/hooks/useAttemptLimit";
import { incrementLocalAttemptCount } from "@/lib/quizlimits/getCountFromLocalStorage";
import { submitQuizAttempt } from "@/app/actions/submit-quiz-attempt";

const TIME_LIMIT = 15 * 60; // in seconds

export function useTimedQuiz() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, initialized } = useAuth();
  const userId = user?.id ?? null;
  const startIncrementRef = useRef(false);

  // UI reducer
  const [ui, dispatch] = useReducer(uiReducer, initialUIState);
  const { uiState, loadingMessage, feedbackMessage, modalState } = ui;

  // Core quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [startTime, setStartTime] = useState(0);
  const [quizActive, setQuizActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unauthenticatedResults, setUnauthenticatedResults] =
    useState<UnauthenticatedResults>({
      score: null,
      totalQuestions: null,
      quizType: "timed",
    });

  // 1) Attempt‐limit check
  const {
    isChecking: isCheckingLimit,
    canAttempt,
    message: limitMessage,
    isLoggedIn: limitIsLoggedIn,
  } = useAttemptLimit("timed");

  // 2) Fetch questions once ready
  const shouldFetch =
    initialized &&
    !isCheckingLimit &&
    canAttempt &&
    uiState !== "SHOWING_MODAL";

  const {
    data: questionsData,
    error: questionsError,
    isLoading: questionsLoading,
  } = useRandomQuestions(shouldFetch, 20);

  // ============================================================================
  // If limit‐check finishes and they can’t attempt, pop your modal
  // ============================================================================
  useEffect(() => {
    if (!isCheckingLimit && !canAttempt) {
      dispatch({
        type: "SHOW_MODAL",
        payload: {
          isOpen: true,
          title: "Access Denied",
          message: limitMessage,
          confirmText: limitIsLoggedIn ? "Upgrade Plan" : "Sign Up",
          cancelText: "Go Home",
          onConfirm: () =>
            router.push(limitIsLoggedIn ? "/pricing" : "/signup"),
          onClose: () => {
            router.push("/");
          },
        },
      });
    }
  }, [isCheckingLimit, canAttempt, limitMessage, limitIsLoggedIn, router]);

  // ============================================================================
  // Loading and Submitting Effects
  // ============================================================================

  useEffect(() => {
    if (!initialized) {
      dispatch({ type: "LOADING", message: "Checking authentication…" });
    } else if (isCheckingLimit) {
      dispatch({ type: "LOADING", message: "Verifying access…" });
    } else if (isSubmitting) {
      dispatch({ type: "LOADING", message: "Submitting results..." });
    } else if (questionsLoading) {
      dispatch({ type: "LOADING", message: "Loading questions…" });
    } else {
      if (uiState === "LOADING") {
        dispatch({ type: "SHOW_QUIZ" });
      }
    }
  }, [initialized, isCheckingLimit, isSubmitting, questionsLoading, uiState]);

  // ============================================================================
  // When questions arrive or error occurs
  // ============================================================================
  useEffect(() => {
    if (questionsError) {
      dispatch({ type: "SHOW_FEEDBACK", message: questionsError.message });
      return;
    }
    if (!questionsLoading && questionsData) {
      if (questionsData.length === 0) {
        dispatch({
          type: "SHOW_FEEDBACK",
          message: "No questions available for this quiz.",
        });
      } else {
        setQuestions(questionsData);
        setStartTime(Date.now());
        setQuizActive(true);
        if (!userId && !startIncrementRef.current) {
          incrementLocalAttemptCount("timed");
          startIncrementRef.current = true;
        }
        dispatch({ type: "SHOW_QUIZ" });
      }
    }
  }, [questionsLoading, questionsError, questionsData, userId]);

  // ============================================================================
  // Quiz Control Functions
  // ============================================================================
  const handleAnswerSelect = useCallback(
    (opt: string) =>
      setSelectedAnswers((p) => ({ ...p, [currentQuestionIndex]: opt })),
    [currentQuestionIndex]
  );
  const finishQuiz = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setQuizActive(false);

    const timeTaken = TIME_LIMIT - timeRemaining;
    const questionIds = questions.map((q) => q.id);

    const payload = {
      userAnswers: selectedAnswers,
      questionIds,
      timeTaken,
      quizMode: "timed" as const,
    };

    try {
      const result = await submitQuizAttempt(payload);

      if (result.error) {
        throw new Error(result.error);
      }

      invalidateQuizAttempts(queryClient, userId);

      if (result.attemptId) {
        router.push(`/results/${result.attemptId}`);
      } else {
        setUnauthenticatedResults({
          score: result.score ?? null,
          totalQuestions: result.totalQuestions ?? null,
          quizType: "timed",
        });
        dispatch({ type: "UNAUTHENTICATED_RESULTS" });
      }
    } catch (err: any) {
      dispatch({ type: "SHOW_FEEDBACK", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    questions,
    selectedAnswers,
    timeRemaining,
    isSubmitting,
    queryClient,
    userId,
    router,
  ]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1)
      setCurrentQuestionIndex((i) => i + 1);
    else finishQuiz();
  }, [currentQuestionIndex, questions.length, finishQuiz]);
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((i) => i - 1);
  }, [currentQuestionIndex]);

  // ============================================================================
  // Timer Effect
  // ============================================================================
  useEffect(() => {
    if (!quizActive) return;
    if (timeRemaining <= 0) {
      finishQuiz();
      return;
    }
    const id = setInterval(() => {
      setTimeRemaining((t) => t - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [quizActive, timeRemaining, finishQuiz]);

  // ============================================================================
  // Return Values
  // ============================================================================
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  return {
    state: {
      uiState,
      loadingMessage,
      feedbackMessage,
      modalState,
      timeRemaining,
    },
    quiz: {
      currentQuestion,
      selectedAnswers,
      currentQuestionIndex,
      progress,
      questions,
    },
    handlers: {
      handleAnswerSelect,
      handleNext,
      handlePrevious,
      finishQuiz,
    },
    uiFlags: {
      isSubmitting,
    },
    unauthenticatedResults,
  };
}
