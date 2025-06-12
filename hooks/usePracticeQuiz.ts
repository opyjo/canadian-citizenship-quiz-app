import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabaseClient from "@/lib/supabase-client";
import { incrementLocalAttemptCount } from "@/lib/quizlimits/getCountFromLocalStorage";
import { checkAttemptLimitsWithAuth } from "@/lib/quizlimits/helpers";
import { usePracticeQuestions } from "./useQuestions";
import { invalidateQuizAttempts } from "@/lib/utils/queryCacheUtils";
import { useAuth } from "@/context/AuthContext";
import {
  parseQuizParams,
  prepareApiPayload,
  calculateScore,
} from "./utils/helpers";
import {
  Question,
  UIState,
  ModalState,
  UnauthenticatedResults,
  ResultData,
} from "./utils/types";

// Define interfaces for our state and props

export function usePracticeQuiz() {
  // Navigation and context
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = supabaseClient;
  const queryClient = useQueryClient();
  const { user, initialized } = useAuth();
  const userId = user?.id ?? null;

  // Parse URL parameters
  const { incorrectOnly, count, mode } = useMemo(
    () => parseQuizParams(searchParams),
    [searchParams]
  );

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [startTime, setStartTime] = useState<number>(0);
  const [practiceType, setPracticeType] = useState<string>("");
  const [isAccessChecked, setIsAccessChecked] = useState(false);

  // UI state
  const [uiState, setUiState] = useState<UIState>("LOADING");
  const [loadingMessage, setLoadingMessage] = useState("Checking access...");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
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
      quizType: "practice",
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
  } = usePracticeQuestions(
    userId,
    incorrectOnly ? 20 : count,
    incorrectOnly,
    shouldFetchQuestions,
    incorrectOnly ? { staleTime: 0, refetchOnMount: true } : undefined
  );

  // ============================================================================
  // Mutation for Quiz Submission
  // ============================================================================

  const { mutate: submitQuiz, isPending: isSubmitting } = useMutation<
    { attemptId?: string; score?: number; totalQuestions?: number },
    Error,
    ResultData
  >({
    mutationFn: async (resultData) => {
      const payload = prepareApiPayload(questions, resultData, practiceType);

      const response = await fetch("/api/quiz-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resultFromApi = await response.json();
      if (!response.ok) {
        throw new Error(
          resultFromApi.error ?? "Failed to save practice quiz attempt"
        );
      }
      return resultFromApi;
    },

    onSuccess: async (data, variables) => {
      invalidateQuizAttempts(queryClient, userId);

      if (data.attemptId) {
        router.push(`/results/${data.attemptId}`);
      } else {
        setUnauthenticatedResults({
          score: variables.score,
          totalQuestions: variables.totalQuestions,
          quizType: "practice",
        });
        setUiState("UNAUTHENTICATED_RESULTS");
      }
    },

    onError: (err) => {
      setFeedbackMessage(err.message ?? "Failed to submit practice quiz.");
      setUiState("SHOWING_FEEDBACK");
    },

    onSettled: async (data, error, variables) => {
      // Track attempt for unauthenticated users
      if (!userId) {
        incrementLocalAttemptCount("practice");
      }

      // Update incorrect questions for authenticated users
      if (userId && variables?.questions) {
        await updateIncorrectQuestions(
          variables.questions,
          userId,
          practiceType,
          supabase,
          queryClient,
          incorrectOnly,
          count
        );
      }
    },
  });

  // ============================================================================
  // Access Control Effect
  // ============================================================================

  useEffect(() => {
    if (!initialized) return;

    async function checkAccess() {
      const result = await checkAttemptLimitsWithAuth(
        user,
        "practice",
        supabase
      );

      if (!result.canAttempt) {
        setModalState({
          isOpen: true,
          title: "Practice Limit Reached",
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

    // Determine practice type
    if (incorrectOnly) {
      setPracticeType("incorrect");
    } else if (mode === "random" && count > 0) {
      setPracticeType("random");
    } else if (uiState !== "SHOWING_MODAL") {
      router.push("/practice");
    }
  }, [
    initialized,
    user,
    supabase,
    router,
    incorrectOnly,
    mode,
    count,
    uiState,
  ]);

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
      message = "Loading practice questions...";
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
        const message = incorrectOnly
          ? "Congratulations! You have no incorrect questions to practice. Well done!"
          : "There are no questions available for this practice session. Please try again later.";
        setFeedbackMessage(message);
        setUiState("SHOWING_FEEDBACK");
      } else {
        setQuestions(questionsData);
        setStartTime(Date.now());
        setUiState("SHOWING_QUIZ");
      }
    }
  }, [
    isLoadingAny,
    questionsError,
    questionsData,
    incorrectOnly,
    uiState,
    isSubmitting,
  ]);

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
    try {
      const score = calculateScore(questions, selectedAnswers);
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      return {
        score,
        totalQuestions: questions.length,
        timeTaken,
        questions: questions.map((q, index) => ({
          ...q,
          selected_option: selectedAnswers[index],
          is_correct:
            selectedAnswers[index]?.trim().toLowerCase() ===
            q.correct_option?.trim().toLowerCase(),
        })),
        practiceType,
      };
    } catch (error) {
      console.error("[PracticeQuizPage] Error in getResultData:", error);
      setFeedbackMessage("Error preparing quiz results. Please try again.");
      setUiState("SHOWING_FEEDBACK");
      throw error;
    }
  }, [questions, selectedAnswers, startTime, practiceType]);

  const finishQuiz = useCallback(() => {
    setUiState("SUBMITTING");
    try {
      const resultData = getResultData();
      submitQuiz(resultData);
    } catch (e) {
      // Error already handled in getResultData
      return;
    }
  }, [getResultData, submitQuiz]);

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
    },
    quiz: {
      currentQuestion,
      selectedAnswers,
      currentQuestionIndex,
      progress,
      practiceType,
      questions,
    },
    handlers: {
      handleAnswerSelect,
      handleNext,
      handlePrevious,
      finishQuiz,
    },
    unauthenticatedResults,
  };
}

// ============================================================================
// Async Helper for Updating Incorrect Questions
// ============================================================================

async function updateIncorrectQuestions(
  questions: any[],
  userId: string,
  practiceType: string,
  supabase: any,
  queryClient: any,
  incorrectOnly: boolean,
  count: number
) {
  try {
    // Add newly incorrect questions
    const newlyIncorrectQuestions = questions
      .filter((q) => !q.is_correct && q.selected_option !== undefined)
      .map((q) => ({ user_id: userId, question_id: q.id }));

    if (newlyIncorrectQuestions.length > 0) {
      await supabase
        .from("user_incorrect_questions")
        .upsert(newlyIncorrectQuestions, {
          onConflict: "user_id,question_id",
        });
    }

    // Remove correctly answered questions if practicing incorrect
    if (practiceType === "incorrect") {
      const correctlyAnswered = questions
        .filter((q) => q.is_correct && q.selected_option !== undefined)
        .map((q) => q.id);

      if (correctlyAnswered.length > 0) {
        await supabase
          .from("user_incorrect_questions")
          .delete()
          .eq("user_id", userId)
          .in("question_id", correctlyAnswered);
      }
    }

    // Invalidate caches
    queryClient.invalidateQueries({
      queryKey: [
        "questions",
        "practice",
        userId,
        incorrectOnly ? 20 : count,
        true,
      ],
    });
    invalidateQuizAttempts(queryClient, userId);
  } catch (error) {
    console.error("Error updating user_incorrect_questions table:", error);
    // Non-critical error, don't show to user
  }
}
