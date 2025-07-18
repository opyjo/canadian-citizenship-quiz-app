"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabaseClient from "@/lib/supabase-client";
import {
  checkAttemptLimits,
  incrementLocalAttemptCount,
} from "@/lib/quizLimits";
import { usePracticeQuestions } from "./useQuestions";
import { invalidateQuizAttempts } from "@/lib/utils/queryCacheUtils";
import { useAuth } from "@/context/AuthContext";

// Define interfaces for our state and props
interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  [key: string]: any;
}

type UIState =
  | "LOADING"
  | "SHOWING_MODAL"
  | "SHOWING_FEEDBACK"
  | "UNAUTHENTICATED_RESULTS"
  | "SHOWING_QUIZ"
  | "SUBMITTING";

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onClose?: () => void;
}

interface ResultData {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  questions: any[];
  practiceType: string;
}

export function usePracticeQuiz() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = supabaseClient;
  const queryClient = useQueryClient();

  // Auth state
  const { user, initialized } = useAuth();
  const userId = user?.id ?? null;

  // Internal state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [startTime, setStartTime] = useState<number>(0);
  const [practiceType, setPracticeType] = useState<string>("");
  const [isAccessChecked, setIsAccessChecked] = useState(false);

  // State for different UI views
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
  const [unauthenticatedResults, setUnauthenticatedResults] = useState<{
    score: number | null;
    totalQuestions: number | null;
    quizType: "standard" | "practice";
  }>({ score: null, totalQuestions: null, quizType: "practice" });

  // Get quiz parameters from URL
  const incorrectOnly = searchParams.get("incorrect") === "true";
  const count = parseInt(searchParams.get("count") ?? "0", 10);
  const mode = searchParams.get("mode");

  // Fetch data using our dedicated TanStack Query hook
  const {
    data: questionsData,
    error: questionsError,
    isLoading: questionsLoading,
  } = usePracticeQuestions(
    userId,
    incorrectOnly ? 20 : count,
    incorrectOnly,
    initialized && isAccessChecked && uiState !== "SHOWING_MODAL",
    incorrectOnly ? { staleTime: 0, refetchOnMount: true } : undefined
  );

  const { mutate: submitQuiz, isPending: isSubmitting } = useMutation<
    { attemptId?: string; score?: number; totalQuestions?: number },
    Error,
    ResultData
  >({
    mutationFn: async (resultData) => {
      const questionIds = questions.map((q) => q.id);
      const userAnswersForApi: Record<string, string> = {};
      resultData.questions.forEach((q: any, index: number) => {
        if (q.selected_option !== undefined) {
          userAnswersForApi[String(index)] = q.selected_option;
        }
      });

      const payload = {
        userAnswers: userAnswersForApi,
        questionIds: questionIds,
        isTimed: false,
        timeTaken: resultData.timeTaken,
        isPractice: true,
        practiceType: practiceType,
        category: null,
      };

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
        await Promise.resolve();
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
      if (!userId) {
        incrementLocalAttemptCount("practice");
      }

      if (userId && variables?.questions) {
        try {
          const newlyIncorrectQuestions = variables.questions
            .filter(
              (q: any) => !q.is_correct && q.selected_option !== undefined
            )
            .map((q: any) => ({ user_id: userId, question_id: q.id }));

          if (newlyIncorrectQuestions.length > 0) {
            await supabase
              .from("user_incorrect_questions")
              .upsert(newlyIncorrectQuestions, {
                onConflict: "user_id,question_id",
              });
          }

          if (practiceType === "incorrect") {
            const correctlyAnswered = variables.questions
              .filter(
                (q: any) => q.is_correct && q.selected_option !== undefined
              )
              .map((q: any) => q.id);

            if (correctlyAnswered.length > 0) {
              await supabase
                .from("user_incorrect_questions")
                .delete()
                .eq("user_id", userId)
                .in("question_id", correctlyAnswered);
            }
          }
          // Only invalidate caches after all DB updates are complete
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
        } catch (dbError: any) {
          console.error(
            "Error updating user_incorrect_questions table:",
            dbError
          );
          // Non-critical, so we don't show a user-facing error
        }
      }
    },
  });

  // Effect for access control
  useEffect(() => {
    if (!initialized) return;

    async function performAccessCheck() {
      const accessResult = await checkAttemptLimits("practice", supabase);

      if (!accessResult.canAttempt) {
        setModalState({
          isOpen: true,
          title: "Access Denied",
          message: accessResult.message,
          confirmText: accessResult.isPaidUser ? "OK" : "Upgrade Plan",
          cancelText: "Go Home",
          onConfirm: () => {
            if (accessResult.isPaidUser) {
              setModalState((prev) => ({ ...prev, isOpen: false }));
              router.push("/practice");
            } else {
              router.push(accessResult.isLoggedIn ? "/pricing" : "/signup");
            }
          },
          onClose: () => router.push("/"),
        });
        setUiState("SHOWING_MODAL");
      }
      setIsAccessChecked(true);
    }

    performAccessCheck();

    // Set practice type based on URL params
    if (incorrectOnly) setPracticeType("incorrect");
    else if (mode === "random" && count > 0) setPracticeType("random");
    else if (uiState !== "SHOWING_MODAL") {
      // Avoid routing away if a modal is already showing
      router.push("/practice");
    }
  }, [
    initialized,
    userId,
    supabase,
    router,
    incorrectOnly,
    mode,
    count,
    uiState,
  ]);

  // Handle combined loading states
  const isLoadingAny = !initialized || questionsLoading || isSubmitting;

  useEffect(() => {
    if (isLoadingAny) {
      const message = !initialized
        ? "Checking authentication..."
        : isSubmitting
        ? "Submitting results..."
        : "Loading practice questions...";
      setLoadingMessage(message);
      setUiState("LOADING");
      return;
    }

    if (questionsError) {
      setFeedbackMessage(questionsError.message);
      setUiState("SHOWING_FEEDBACK");
      return;
    }

    if (questionsData) {
      if (questionsData.length === 0) {
        if (incorrectOnly) {
          setFeedbackMessage(
            "Congratulations! You have no incorrect questions to practice. Well done!"
          );
          setUiState("SHOWING_FEEDBACK");
        }
        if (!incorrectOnly) {
          setFeedbackMessage(
            "There are no questions available for this practice session. Please try again later."
          );
          setUiState("SHOWING_FEEDBACK");
        }
      }
      if (uiState === "LOADING" && !isSubmitting) {
        setQuestions(questionsData);
        setStartTime(Date.now());
        setUiState("SHOWING_QUIZ");
      }
    }
  }, [
    isLoadingAny,
    !initialized,
    isSubmitting,
    questionsError,
    questionsData,
    incorrectOnly,
  ]);

  // Event Handlers
  const handleAnswerSelect = (option: string) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: option });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getResultData = (): ResultData => {
    try {
      const score = questions.filter(
        (q, index) =>
          selectedAnswers[index]?.trim().toLowerCase() ===
          q.correct_option?.trim().toLowerCase()
      ).length;
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      const results = {
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
      return results;
    } catch (error) {
      console.error("[PracticeQuizPage] Error in getResultData:", error);
      setFeedbackMessage("Error preparing quiz results. Please try again.");
      setUiState("SHOWING_FEEDBACK");
      throw error;
    }
  };

  const finishQuiz = () => {
    setUiState("SUBMITTING");
    try {
      const localResultData = getResultData();
      submitQuiz(localResultData);
    } catch (e) {
      // getResultData already handles the error state
      return;
    }
  };

  // Returned state and handlers for the UI component
  return {
    state: {
      uiState,
      loadingMessage,
      feedbackMessage,
      modalState,
    },
    quiz: {
      currentQuestion: questions[currentQuestionIndex],
      selectedAnswers,
      currentQuestionIndex,
      progress:
        questions.length > 0
          ? ((currentQuestionIndex + 1) / questions.length) * 100
          : 0,
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
