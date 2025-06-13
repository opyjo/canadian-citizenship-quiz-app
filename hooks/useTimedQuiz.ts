import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabaseClient from "@/lib/supabase-client";
import { checkAttemptLimitsWithAuth } from "@/lib/quizlimits/helpers";
import { invalidateQuizAttempts } from "@/lib/utils/queryCacheUtils";
import { useAuth } from "@/context/AuthContext";
import { useRandomQuestions } from "./useQuestions";
import { Question, UIState, ModalState } from "../app/utils/types";

// Define interfaces specific to timed quiz
interface ResultData {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  questions: any[];
}

interface UnauthenticatedResults {
  score: number | null;
  totalQuestions: number | null;
}

const TIME_LIMIT = 15 * 60; // 15 minutes in seconds

export function useTimedQuiz() {
  // Navigation and context
  const router = useRouter();
  const supabase = supabaseClient;
  const queryClient = useQueryClient();
  const { user, initialized } = useAuth();
  const userId = user?.id ?? null;

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [isAccessChecked, setIsAccessChecked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
  const [quizActive, setQuizActive] = useState(false);

  // UI state
  const [uiState, setUiState] = useState<UIState>("LOADING");
  const [loadingMessage, setLoadingMessage] = useState("Checking access...");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isConfirmEndQuizModalOpen, setIsConfirmEndQuizModalOpen] =
    useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
  });
  const [unauthenticatedResults, setUnauthenticatedResults] =
    useState<UnauthenticatedResults>({
      score: null,
      totalQuestions: null,
    });

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const shouldFetchQuestions =
    initialized && isAccessChecked && uiState !== "SHOWING_MODAL";

  const {
    data: questionsData,
    error: questionsError,
    isLoading: questionsLoading,
  } = useRandomQuestions(shouldFetchQuestions, 20);

  // ============================================================================
  // Mutation for Quiz Submission
  // ============================================================================

  const { mutate: submitQuiz, isPending: isSubmitting } = useMutation<
    { attemptId?: string; score?: number; totalQuestions?: number },
    Error,
    ResultData
  >({
    mutationFn: async (resultData) => {
      setQuizActive(false);
      const questionIds = questions.map((q) => q.id);
      const userAnswersForApi: Record<string, string> = {};
      resultData.questions.forEach((q: any) => {
        if (q.selected_option !== undefined) {
          userAnswersForApi[String(q.index)] = q.selected_option;
        }
      });
      const payload = {
        userAnswers: userAnswersForApi,
        questionIds,
        isTimed: true,
        timeTaken: resultData.timeTaken,
        isPractice: false,
        practiceType: null,
      };

      const response = await fetch("/api/quiz-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resultFromApi = await response.json();
      if (!response.ok) {
        throw new Error(resultFromApi.error ?? "Failed to save quiz attempt");
      }
      return resultFromApi;
    },

    onSuccess: (data) => {
      invalidateQuizAttempts(queryClient, userId);

      if (data.attemptId) {
        router.push(`/results/${data.attemptId}`);
      } else {
        setUnauthenticatedResults({
          score: data.score ?? null,
          totalQuestions: data.totalQuestions ?? null,
        });
        setUiState("UNAUTHENTICATED_RESULTS");
      }
    },

    onError: (err) => {
      setFeedbackMessage(err.message || "Failed to submit timed quiz.");
      setUiState("SHOWING_FEEDBACK");
    },
  });

  // ============================================================================
  // Access Control Effect
  // ============================================================================

  useEffect(() => {
    if (!initialized) return;

    async function checkAccess() {
      const result = await checkAttemptLimitsWithAuth(user, "timed", supabase);

      if (!result.canAttempt) {
        setModalState({
          isOpen: true,
          title: "Access Denied",
          message: result.message,
          confirmText: result.isLoggedIn ? "Upgrade Plan" : "Sign Up",
          cancelText: "Go Home",
          onConfirm: () =>
            router.push(result.isLoggedIn ? "/pricing" : "/signup"),
          onClose: () => router.push("/"),
        });
        setUiState("SHOWING_MODAL");
      }
      setIsAccessChecked(true);
    }

    checkAccess();
  }, [initialized, user, supabase, router]);

  // ============================================================================
  // Loading and Data Management Effect
  // ============================================================================

  const isLoadingAny = !initialized || questionsLoading || isSubmitting;

  useEffect(() => {
    let message = "";
    if (!initialized) {
      message = "Checking authentication...";
    } else if (isSubmitting) {
      message = "Submitting results...";
    } else {
      message = "Loading questions...";
    }
    setLoadingMessage(message);
    setUiState("LOADING");
  }, [isSubmitting]);

  useEffect(() => {
    if (isLoadingAny) {
      if (questionsError) {
        setFeedbackMessage(questionsError.message);
        setUiState("SHOWING_FEEDBACK");
      }
      return;
    }

    if (questionsData && uiState === "LOADING" && !isSubmitting) {
      if (questionsData.length === 0) {
        setFeedbackMessage("No questions available for this quiz.");
        setUiState("SHOWING_FEEDBACK");
      } else {
        setQuestions(questionsData);
        setQuizActive(true);
        setUiState("SHOWING_QUIZ");
      }
    }
  }, [isLoadingAny, questionsError, questionsData, uiState, isSubmitting]);

  // ============================================================================
  // Timer Effect
  // ============================================================================

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && quizActive) {
      finishQuiz();
    }
    return () => clearInterval(timer);
  }, [quizActive, timeRemaining]);

  // ============================================================================
  // Quiz Control Functions
  // ============================================================================

  const handleAnswerSelect = useCallback(
    (option: string) => {
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: option,
      }));
    },
    [currentQuestionIndex]
  );

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  }, [currentQuestionIndex, questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const getResultData = useCallback((): ResultData => {
    const timeTaken = TIME_LIMIT - timeRemaining;
    return {
      score: questions.filter(
        (q, index) =>
          selectedAnswers[index]?.toLowerCase() ===
          q.correct_option.toLowerCase()
      ).length,
      totalQuestions: questions.length,
      timeTaken,
      questions: questions.map((q, index) => ({
        ...q,
        index,
        selected_option: selectedAnswers[index],
        is_correct:
          selectedAnswers[index]?.toLowerCase() ===
          q.correct_option.toLowerCase(),
      })),
    };
  }, [questions, selectedAnswers, timeRemaining]);

  const finishQuiz = useCallback(() => {
    setUiState("SUBMITTING");
    if (isSubmitting) return;
    const resultData = getResultData();
    submitQuiz(resultData);
  }, [getResultData, submitQuiz, isSubmitting]);

  const handleEndQuiz = useCallback(() => {
    setIsConfirmEndQuizModalOpen(true);
  }, []);

  const handleCloseConfirmModal = useCallback(() => {
    setIsConfirmEndQuizModalOpen(false);
  }, []);

  const handleConfirmEndQuiz = useCallback(() => {
    finishQuiz();
    setIsConfirmEndQuizModalOpen(false);
  }, [finishQuiz]);

  // ============================================================================
  // Return Values
  // ============================================================================

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  return {
    state: {
      uiState,
      loadingMessage,
      feedbackMessage,
      modalState,
      isConfirmEndQuizModalOpen,
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
      handleEndQuiz,
      handleCloseConfirmModal,
      handleConfirmEndQuiz,
      finishQuiz,
    },
    unauthenticatedResults,
  };
}
