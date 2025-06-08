"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import supabaseClient from "@/lib/supabase-client";
import { Loader2 } from "lucide-react";
import {
  incrementLocalAttemptCount,
  checkAttemptLimits,
} from "@/lib/quizLimits";
import ConfirmationModal from "@/components/confirmation-modal";
import { usePracticeQuestions } from "@/lib/hooks/useQuestions";

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

function PracticeQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [practiceType, setPracticeType] = useState<string>("");
  const supabase = supabaseClient;
  const [isAccessChecked, setIsAccessChecked] = useState(false);

  const incorrectOnly = searchParams.get("incorrect") === "true";
  const count = parseInt(searchParams.get("count") || "0", 10);
  const mode = searchParams.get("mode");

  const {
    data: questionsData,
    error: questionsError,
    isLoading: questionsLoading,
  } = usePracticeQuestions(
    userId,
    incorrectOnly ? 20 : count, // Fetch up to 20 if incorrect, otherwise use count
    incorrectOnly
  );

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
  });

  // New state for unauthenticated results
  const [showUnauthenticatedResults, setShowUnauthenticatedResults] =
    useState(false);
  const [unauthenticatedScore, setUnauthenticatedScore] = useState<
    number | null
  >(null);
  const [unauthenticatedTotalQuestions, setUnauthenticatedTotalQuestions] =
    useState<number | null>(null);

  useEffect(() => {
    async function performAccessCheckAndSetUser() {
      // Step 1: Perform access check first
      const accessResult = await checkAttemptLimits("practice", supabase);
      setIsAccessChecked(true);

      if (!accessResult.canAttempt) {
        setLoading(false);
        let confirmText = "OK";
        let onConfirmAction = () => router.push("/practice");

        if (!accessResult.isLoggedIn) {
          confirmText = "Sign Up";
          onConfirmAction = () => router.push("/signup");
        } else if (!accessResult.isPaidUser) {
          confirmText = "Upgrade Plan";
          onConfirmAction = () => router.push("/pricing");
        }

        setModalState({
          isOpen: true,
          title: "Access Denied",
          message: accessResult.message,
          confirmText,
          cancelText: "Go Home",
          onConfirm: () => {
            onConfirmAction();
            setModalState((prev) => ({ ...prev, isOpen: false }));
          },
        });
        return;
      }

      // Step 2: Set user ID if access is granted. This enables the usePracticeQuestions hook.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null); // Hook will run if userId changes from null

      // Set practice type for UI elements
      if (incorrectOnly) {
        setPracticeType("incorrect");
      } else if (mode === "random" && count > 0) {
        setPracticeType("random");
      } else {
        // Invalid parameters, redirect
        router.push("/practice");
      }
    }

    performAccessCheckAndSetUser();
  }, [supabase, router, incorrectOnly, mode, count]);

  useEffect(() => {
    // This effect now reacts to the state from the usePracticeQuestions hook
    if (questionsLoading) {
      setLoading(true);
      return;
    }

    setLoading(false);
    setStartTime(Date.now());

    if (questionsError) {
      setError(questionsError.message || "Failed to load practice questions.");
      return;
    }

    if (questionsData) {
      if (incorrectOnly && questionsData.length === 0) {
        setError(
          "Congratulations! You have no incorrect questions to practice. Well done!"
        );
      }
      if (!incorrectOnly && mode === "random" && questionsData.length === 0) {
        setError("No questions available for random practice.");
      }
      setQuestions(questionsData);
    }
  }, [questionsData, questionsError, questionsLoading, incorrectOnly, mode]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const handleAnswerSelect = (option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: option,
    });
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

  const getResultData = () => {
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
      setError("Error preparing quiz results. Please try again."); // Update error state
      throw error; // Re-throw to stop finishQuiz if critical
    }
  };

  const finishQuiz = async () => {
    let localResultData;
    try {
      localResultData = getResultData(); // This contains score, totalQuestions etc. calculated locally
    } catch (e) {
      // Error already logged and setError called in getResultData
      return; // Stop execution if getResultData failed
    }

    setError(null); // Clear previous errors
    setLoading(true); // Show loading indicator

    const questionIds = questions.map((q) => q.id);
    const userAnswersForApi: Record<string, string> = {};
    localResultData.questions.forEach((q: any, index: number) => {
      if (q.selected_option !== undefined) {
        userAnswersForApi[String(index)] = q.selected_option;
      }
    });

    const payload = {
      userAnswers: userAnswersForApi,
      questionIds: questionIds,
      isTimed: false,
      timeTaken: localResultData.timeTaken,
      isPractice: true,
      practiceType: practiceType,
      category: null,
    };

    let attemptIdToRedirect: string | null = null;

    try {
      const response = await fetch("/api/quiz-attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resultFromApi = await response.json(); // API response

      if (!response.ok) {
        throw new Error(
          resultFromApi.error || "Failed to save practice quiz attempt"
        );
      }

      attemptIdToRedirect = resultFromApi.attemptId;

      if (attemptIdToRedirect) {
        // If attemptId is present, user was authenticated and attempt was saved.
        // Redirect to the results page.
        router.push(`/results/${attemptIdToRedirect}`);
      } else {
        // No attemptId means user is unauthenticated or API decided not to save.
        // Use locally calculated score and total for display.
        setUnauthenticatedScore(localResultData.score);
        setUnauthenticatedTotalQuestions(localResultData.totalQuestions);
        setShowUnauthenticatedResults(true);
      }
    } catch (err: any) {
      console.error("[PracticeQuizPage] Error submitting practice quiz:", err);
      setError(
        err.message || "Failed to submit practice quiz. Please try again."
      );
      setShowUnauthenticatedResults(false);
    } finally {
      setLoading(false);
    }

    if (!userId) {
      incrementLocalAttemptCount("practice");
    }

    if (userId) {
      try {
        // Logic for questions the user got wrong IN THIS SESSION
        const newlyIncorrectQuestions = localResultData.questions
          .filter((q: any) => !q.is_correct && q.selected_option !== undefined)
          .map((q: any) => ({
            user_id: userId,
            question_id: q.id,
          }));

        if (newlyIncorrectQuestions.length > 0) {
          const { error: upsertError } = await supabase
            .from("user_incorrect_questions")
            .upsert(newlyIncorrectQuestions, {
              onConflict: "user_id,question_id",
              ignoreDuplicates: false,
            });
          if (upsertError) {
            console.error(
              "[PracticeQuizPage] Error upserting newly incorrect questions:",
              upsertError
            );
            // Optionally set an error state for the user
          }
        }

        // New logic: If this was a session for practicing incorrect questions,
        // remove questions they got right from the user_incorrect_questions table.
        if (practiceType === "incorrect") {
          // Make sure practiceType reflects the mode
          const correctlyAnsweredInThisSession = localResultData.questions
            .filter((q: any) => q.is_correct && q.selected_option !== undefined)
            .map((q: any) => q.id);

          if (correctlyAnsweredInThisSession.length > 0) {
            const { error: deleteError } = await supabase
              .from("user_incorrect_questions")
              .delete()
              .eq("user_id", userId)
              .in("question_id", correctlyAnsweredInThisSession);

            if (deleteError) {
              console.error(
                "[PracticeQuizPage] Error removing correctly answered questions:",
                deleteError
              );
              // Optionally set an error state for the user
            }
          }
        }
      } catch (errorLogging) {
        console.error(
          "[PracticeQuizPage] Error updating user_incorrect_questions table:",
          errorLogging
        );
      }
    }
    // No explicit redirect here if unauthenticated or error, as those states render different UI.
  };

  if (showUnauthenticatedResults) {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Practice Finished!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {unauthenticatedScore !== null &&
          unauthenticatedTotalQuestions !== null ? (
            <p className="text-2xl">
              You scored: {unauthenticatedScore} /{" "}
              {unauthenticatedTotalQuestions}
            </p>
          ) : (
            <p>Your score is being calculated...</p> // Should not happen if localResultData is always available
          )}
          <p className="text-sm text-muted-foreground">
            As you are not logged in, your results are not saved.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => router.push("/practice")}
            className="w-full sm:w-auto"
          >
            Try Another Practice
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full sm:w-auto"
          >
            Return Home
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (modalState.isOpen) {
    return (
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
        onClose={() => {
          router.push("/");
          setModalState((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    );
  }

  if (!isAccessChecked && loading && !showUnauthenticatedResults) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <p className="text-lg">Checking access...</p>
      </div>
    );
  }

  if (loading && !showUnauthenticatedResults) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <p className="text-lg">Loading practice questions...</p>
      </div>
    );
  }

  if (error && !showUnauthenticatedResults) {
    return (
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle
            className={`${
              error.startsWith("Congratulations")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {error.startsWith("Congratulations") ? "All Clear!" : "Error"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              if (error.startsWith("Congratulations")) {
                router.push("/"); // Go home if all clear
              } else {
                router.push("/practice"); // Go back to practice options for other errors
              }
            }}
          >
            {error.startsWith("Congratulations")
              ? "Return Home"
              : "Return to Practice Options"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!currentQuestion && !loading && !error && !showUnauthenticatedResults) {
    return (
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>No Questions Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            There are no questions available for this practice session. This
            might be because all incorrect questions have been cleared or no
            questions match the selected criteria.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/practice")}>
            Return to Practice Options
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If quiz is finished via unauth path, but questions somehow still loaded, this will prevent quiz UI
  if (showUnauthenticatedResults) return null;

  return (
    <div className="max-w-3xl w-full space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
            {practiceType === "incorrect"
              ? "Incorrect Questions"
              : "Random Practice"}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">
            {currentQuestion.question_text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {["a", "b", "c", "d"].map((option) => (
            <div
              key={option}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedAnswers[currentQuestionIndex] === option
                  ? "border-red-600 bg-red-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleAnswerSelect(option)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    selectedAnswers[currentQuestionIndex] === option
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-gray-300"
                  }`}
                >
                  <span className="text-sm">{option.toUpperCase()}</span>
                </div>
                <span>
                  {currentQuestion[`option_${option}` as keyof Question]}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedAnswers[currentQuestionIndex]}
          >
            {currentQuestionIndex === questions.length - 1
              ? "Finish Practice"
              : "Next Question"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Loading fallback component
function PracticeQuizLoading() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      <p className="text-lg">Loading practice quiz...</p>
    </div>
  );
}

// Main component with Suspense wrapper
export default function PracticeQuizPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center p-4">
      <Suspense fallback={<PracticeQuizLoading />}>
        <PracticeQuizContent />
      </Suspense>
    </div>
  );
}
