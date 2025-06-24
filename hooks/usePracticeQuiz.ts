import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useReducer,
  useMemo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import supabaseClient from "@/lib/supabase-client";
import { incrementLocalAttemptCount } from "@/lib/quizlimits/getCountFromLocalStorage";
import {
  useIncorrectPracticeQuestions,
  useRandomQuestions,
} from "./useQuestions";
import { invalidateQuizAttempts } from "@/lib/utils/queryCacheUtils";
import { useAuth } from "@/context/AuthContext";
import { usePracticeParams } from "./usePracticeParams";
import { uiReducer, initialUIState } from "../app/utils/reducers/uiReducer";
import { Question, UnauthenticatedResults } from "../app/utils/types";
import { useAttemptLimit } from "./useAttemptLimit";
import { submitQuizAttempt } from "@/app/actions/submit-quiz-attempt";

export function usePracticeQuiz() {
  // Navigation and context
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = supabaseClient;
  const queryClient = useQueryClient();
  const { user, initialized } = useAuth();
  const userId = user?.id ?? null;
  const incrementedRef = useRef(false);

  // Parse URL parameters and determine practice type immediately
  const { incorrectOnly, count, practiceType, shouldRedirect } =
    usePracticeParams(searchParams);

  // checking the attempt limit
  const {
    isChecking: isCheckingLimit,
    canAttempt,
    message: limitMessage,
    isLoggedIn: limitIsLoggedIn,
  } = useAttemptLimit("practice");

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [startTime, setStartTime] = useState<number>(0);
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  // single reducer for all UI‐related state
  const [ui, dispatch] = useReducer(uiReducer, initialUIState);
  const { uiState, loadingMessage, feedbackMessage, modalState } = ui;

  const [unauthenticatedResults, setUnauthenticatedResults] =
    useState<UnauthenticatedResults>({
      score: null,
      totalQuestions: null,
      quizType: "practice",
    });

  // Only fetch once auth, limit‐check and redirect‐guard pass
  const shouldFetchQuestions =
    initialized &&
    !isCheckingLimit &&
    canAttempt &&
    uiState !== "SHOWING_MODAL" &&
    !shouldRedirect;

  // ============================================================================
  // If limit‐check finishes and they can't attempt, pop your modal
  // ============================================================================
  useEffect(() => {
    if (!isCheckingLimit && !canAttempt) {
      dispatch({
        type: "SHOW_MODAL",
        payload: {
          isOpen: true,
          title: "Practice Limit Reached",
          message: limitMessage,
          confirmText: limitIsLoggedIn ? "Upgrade Plan" : "Sign Up",
          cancelText: "Later",
          onConfirm: () =>
            router.push(limitIsLoggedIn ? "/pricing" : "/signup"),
          onClose: () => {
            router.push("/practice");
          },
        },
      });
    }
  }, [isCheckingLimit, canAttempt, limitMessage, limitIsLoggedIn, router]);

  // ============================================================================
  // Redirect Effect (but only if quiz hasn't started)
  // ============================================================================

  useEffect(() => {
    if (initialized && shouldRedirect && !isQuizStarted) {
      router.push("/practice");
    }
  }, [initialized, shouldRedirect, isQuizStarted, router]);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const {
    data: incorrectQuestionsData,
    error: incorrectQuestionsError,
    isLoading: incorrectQuestionsLoading,
  } = useIncorrectPracticeQuestions(
    userId,
    incorrectOnly && shouldFetchQuestions
  );

  const {
    data: randomQuestionsData,
    error: randomQuestionsError,
    isLoading: randomQuestionsLoading,
  } = useRandomQuestions(count, !incorrectOnly && shouldFetchQuestions);

  // Coalesce the results from the two hooks
  const questionsData = incorrectOnly
    ? incorrectQuestionsData
    : randomQuestionsData;
  const questionsError = incorrectOnly
    ? incorrectQuestionsError
    : randomQuestionsError;
  const questionsLoading = incorrectOnly
    ? incorrectQuestionsLoading
    : randomQuestionsLoading;

  // ============================================================================
  // Loading and Submitting Effects
  // ============================================================================
  useEffect(() => {
    if (!initialized) {
      dispatch({ type: "LOADING", message: "Checking authentication…" });
      return;
    }
    if (isCheckingLimit) {
      dispatch({ type: "LOADING", message: "Verifying attempt limits…" });
      return;
    }
    if (questionsLoading) {
      dispatch({ type: "LOADING", message: "Loading practice questions…" });
      return;
    }

    // Only proceed if we have finished loading and have data
    if (!questionsLoading && questionsData !== undefined) {
      if (questionsData.length > 0) {
        setStartTime(Date.now());
        setIsQuizStarted(true);
        if (!userId && !incrementedRef.current) {
          incrementLocalAttemptCount("practice");
          incrementedRef.current = true;
        }
        dispatch({ type: "SHOW_QUIZ" });
      } else {
        const msg = incorrectOnly
          ? "Congratulations! No incorrect questions left."
          : "No questions available, please try again later.";
        dispatch({ type: "SHOW_FEEDBACK", message: msg });
      }
    }
  }, [
    initialized,
    isCheckingLimit,
    questionsLoading,
    questionsData,
    incorrectOnly,
    userId,
  ]);

  // ============================================================================
  // When questions arrive or error occurs
  // ============================================================================
  useEffect(() => {
    if (questionsError) {
      dispatch({ type: "SHOW_FEEDBACK", message: questionsError.message });
      return;
    }
  }, [questionsError]);

  // ============================================================================
  // Quiz Control Functions
  // ============================================================================

  const finishQuiz = useCallback(async () => {
    dispatch({ type: "SUBMITTING" });

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const questionIds = (questionsData ?? []).map((q) => q.id);

    const payload = {
      userAnswers: selectedAnswers,
      questionIds,
      timeTaken,
      isPractice: true,
      isTimed: false,
      practiceType,
      quizMode: "practice" as const,
    };

    try {
      const result = await submitQuizAttempt(payload);

      if (result.error) {
        throw new Error(result.error);
      }

      // Invalidate the list of past attempts
      invalidateQuizAttempts(queryClient, userId);

      // ALSO invalidate the incorrect questions count, as it may have changed.
      queryClient.invalidateQueries({
        queryKey: ["incorrectQuestionsCount", userId],
      });

      if (result.attemptId) {
        // Authenticated → redirect to the results page
        router.push(`/results/${result.attemptId}`);
      } else {
        // Guest → stash the score & total from the *result*
        setUnauthenticatedResults({
          score: result.score ?? null,
          totalQuestions: result.totalQuestions ?? null,
          quizType: practiceType as "incorrect" | "random",
        });
        // Flip the UI into the guest‐results view
        dispatch({ type: "UNAUTHENTICATED_RESULTS" });
      }
      if (userId) {
        const questionsWithAnswers = (questionsData ?? []).map((q, i) => ({
          ...q,
          selected_option: selectedAnswers[i],
          is_correct:
            selectedAnswers[i]?.trim().toLowerCase() ===
            q.correct_option?.trim().toLowerCase(),
        }));
        updateIncorrectQuestions(
          questionsWithAnswers,
          userId,
          practiceType,
          supabase,
          queryClient,
          incorrectOnly,
          count
        );
      }
    } catch (error: any) {
      dispatch({ type: "SHOW_FEEDBACK", message: error.message });
    }
  }, [
    startTime,
    questionsData,
    selectedAnswers,
    practiceType,
    queryClient,
    userId,
    router,
    supabase,
    incorrectOnly,
    count,
  ]);

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
    if (currentQuestionIndex < (questionsData?.length ?? 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  }, [currentQuestionIndex, questionsData, finishQuiz]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  // ============================================================================
  // Contruct the result(payload) and create finishQuiz function
  // ============================================================================

  // Return Values
  // ============================================================================
  const currentQuestion = questionsData?.[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / (questionsData?.length ?? 1)) * 100;

  return {
    uiState,
    loadingMessage,
    feedbackMessage,
    modalState,
    quizData: {
      currentQuestion,
      selectedAnswers,
      currentQuestionIndex,
      progress,
      practiceType,
      questions: questionsData ?? [],
    },
    quizHandlers: {
      handleAnswerSelect,
      handlePrevious,
      handleNext,
      finishQuiz,
    },
    unauthenticatedResults,
    isQuizStarted,
    isCheckingLimit,
    canAttempt,
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
