import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabaseClient from "@/lib/supabase-client";
import {
  checkAttemptLimits,
  incrementLocalAttemptCount,
} from "@/lib/quizLimits";
import { queryKeys } from "@/lib/query-client";
import { invalidateQuizAttempts } from "@/lib/utils/queryCacheUtils";
import { useAuthUser } from "./useAuthUser";

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
}

const TIME_LIMIT = 15 * 60; // 15 minutes in seconds

// Data fetching function for useQuery
const fetchTimedQuestions = async () => {
  const { data, error } = await supabaseClient.rpc(
    "get_random_questions" as any,
    {
      question_limit: 20,
    }
  );

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("No questions available for the quiz.");
  }
  return data as Question[];
};

export function useTimedQuiz() {
  const router = useRouter();
  const supabase = supabaseClient;
  const queryClient = useQueryClient();

  // Auth state
  const {
    data: user,
    isLoading: authLoading,
    error: authError,
  } = useAuthUser();
  const userId = user?.id ?? null;

  // Internal state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [isAccessChecked, setIsAccessChecked] = useState(false);
  const [isConfirmEndQuizModalOpen, setIsConfirmEndQuizModalOpen] =
    useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
  const [quizActive, setQuizActive] = useState(false);

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
  }>({ score: null, totalQuestions: null });

  const {
    data: questionsData,
    error: questionsError,
    isLoading: questionsLoading,
  } = useQuery({
    queryKey: ["timedQuizQuestions"],
    queryFn: fetchTimedQuestions,
    enabled: isAccessChecked && uiState !== "SHOWING_MODAL",
    staleTime: Infinity,
    gcTime: 0,
  });

  const finishQuizMutation = useMutation<
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
      invalidateQuizAttempts(queryClient, userId ?? null);
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
    onSettled: () => {
      if (!userId) {
        incrementLocalAttemptCount("timed");
      }
    },
  });

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
    if (finishQuizMutation.isPending) return;
    const resultData = getResultData();
    finishQuizMutation.mutate(resultData);
  }, [getResultData, finishQuizMutation]);

  // Effect for access control
  useEffect(() => {
    if (authLoading) return;
    if (authError) {
      setFeedbackMessage("Authentication failed. Please try again.");
      setUiState("SHOWING_FEEDBACK");
      return;
    }
    // Wait until userId is determined.
    if (userId === undefined) return;

    async function performAccessCheck() {
      const accessResult = await checkAttemptLimits("timed", supabase);
      if (!accessResult.canAttempt) {
        let confirmText = accessResult.isPaidUser ? "OK" : "Upgrade Plan";
        if (!accessResult.isLoggedIn) confirmText = "Sign Up";

        setModalState({
          isOpen: true,
          title: "Access Denied",
          message: accessResult.message,
          confirmText,
          cancelText: "Go Home",
          onConfirm: () => {
            if (!accessResult.isLoggedIn) router.push("/signup");
            else if (!accessResult.isPaidUser) router.push("/pricing");
            else router.push("/");
            setModalState((prev) => ({ ...prev, isOpen: false }));
          },
          onClose: () => router.push("/"),
        });
        setUiState("SHOWING_MODAL");
      }
      setIsAccessChecked(true);
    }
    performAccessCheck();
  }, [authLoading, authError, userId, supabase, router]);

  // Handle combined loading states
  const isLoadingAny =
    authLoading || questionsLoading || finishQuizMutation.isPending;

  useEffect(() => {
    if (isLoadingAny) {
      setLoadingMessage(
        authLoading
          ? "Checking authentication..."
          : finishQuizMutation.isPending
          ? "Submitting results..."
          : "Loading questions..."
      );
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
        setFeedbackMessage("No questions available for this quiz.");
        setUiState("SHOWING_FEEDBACK");
      } else if (uiState === "LOADING" && !finishQuizMutation.isPending) {
        setQuestions(questionsData);
        setQuizActive(true);
        setUiState("SHOWING_QUIZ");
      }
    }
  }, [
    isLoadingAny,
    authLoading,
    finishQuizMutation.isPending,
    questionsError,
    questionsData,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && quizActive) {
      finishQuiz();
    }
    return () => clearInterval(timer);
  }, [quizActive, timeRemaining, finishQuiz]);

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

  const handleEndQuiz = () => setIsConfirmEndQuizModalOpen(true);
  const handleCloseConfirmModal = () => setIsConfirmEndQuizModalOpen(false);
  const handleConfirmEndQuiz = () => {
    finishQuiz();
    setIsConfirmEndQuizModalOpen(false);
  };

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
      currentQuestion: questions[currentQuestionIndex],
      selectedAnswers,
      currentQuestionIndex,
      progress:
        questions.length > 0
          ? ((currentQuestionIndex + 1) / questions.length) * 100
          : 0,
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
