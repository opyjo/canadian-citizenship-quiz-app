import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import supabaseClient from "@/lib/supabase-client";
import {
  checkAttemptLimits,
  incrementLocalAttemptCount,
} from "@/lib/quizLimits";

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
  | "SHOWING_QUIZ";

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

// Data fetching function for useQuery
const fetchStandardQuestions = async () => {
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

export function useStandardQuiz() {
  const router = useRouter();
  const supabase = supabaseClient;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [startTime, setStartTime] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConfirmEndQuizModalOpen, setIsConfirmEndQuizModalOpen] =
    useState(false);
  const [isAccessChecked, setIsAccessChecked] = useState(false);

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
  }>({ score: null, totalQuestions: null, quizType: "standard" });

  const {
    data: questionsData,
    error: questionsError,
    isLoading: questionsLoading,
  } = useQuery({
    queryKey: ["standardQuizQuestions"],
    queryFn: fetchStandardQuestions,
    enabled: isAccessChecked && uiState !== "SHOWING_MODAL", // Only fetch after access check is complete
    staleTime: Infinity,
    gcTime: 0,
  });

  const { mutate: submitQuiz, isPending: isSubmitting } = useMutation<
    { attemptId?: string; score?: number; totalQuestions?: number },
    Error,
    ResultData
  >({
    mutationFn: async (resultData) => {
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
        isTimed: false,
        timeTaken: null,
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
        throw new Error(resultFromApi.error || "Failed to save quiz attempt");
      }
      return resultFromApi;
    },
    onSuccess: (data, variables) => {
      if (data.attemptId) {
        router.push(`/results/${data.attemptId}`);
      } else {
        setUnauthenticatedResults({
          score: data.score ?? null,
          totalQuestions: data.totalQuestions ?? null,
          quizType: "standard",
        });
        setUiState("UNAUTHENTICATED_RESULTS");
      }
    },
    onError: (err) => {
      setFeedbackMessage(err.message || "Failed to submit practice quiz.");
      setUiState("SHOWING_FEEDBACK");
    },
    onSettled: () => {
      if (!userId) {
        incrementLocalAttemptCount("standard");
      }
    },
  });

  useEffect(() => {
    // First, get the user so we know if they are logged in or not.
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    // Once we have a userId (or we know it's null), check access limits.
    // This prevents a race condition on the initial load.
    if (userId === undefined) return; // Wait until userId is determined

    async function performAccessCheck() {
      const accessResult = await checkAttemptLimits("standard", supabase);

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
      setIsAccessChecked(true); // Mark the check as complete
    }

    performAccessCheck();
  }, [userId, supabase, router]);

  useEffect(() => {
    if (questionsLoading || isSubmitting) {
      setLoadingMessage(
        isSubmitting ? "Submitting results..." : "Loading questions..."
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
      } else if (uiState === "LOADING" && !isSubmitting) {
        setQuestions(questionsData);
        setStartTime(Date.now());
        setUiState("SHOWING_QUIZ");
      }
    }
  }, [uiState, questionsData, questionsError, questionsLoading, isSubmitting]);

  const getResultData = (): ResultData => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const results = {
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
    return results;
  };

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

  const finishQuiz = () => {
    const resultData = getResultData();
    submitQuiz(resultData);
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
