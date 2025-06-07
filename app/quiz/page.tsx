"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import ConfirmationModal from "@/components/confirmation-modal";
import {
  checkAttemptLimits,
  incrementLocalAttemptCount,
} from "@/lib/quizLimits";

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

export default function QuizPage() {
  const router = useRouter();
  const supabase = supabaseClient;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmEndQuizModalOpen, setIsConfirmEndQuizModalOpen] =
    useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // New state for unauthenticated results
  const [showUnauthenticatedResults, setShowUnauthenticatedResults] =
    useState(false);
  const [unauthenticatedScore, setUnauthenticatedScore] = useState<
    number | null
  >(null);
  const [unauthenticatedTotalQuestions, setUnauthenticatedTotalQuestions] =
    useState<number | null>(null);

  const [isAccessChecked, setIsAccessChecked] = useState(false);
  const [limitModalState, setLimitModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onClose?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
  });

  useEffect(() => {
    async function performAccessCheckAndFetchData() {
      const accessResult = await checkAttemptLimits("standard", supabase);
      setIsAccessChecked(true);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUserId(authUser?.id ?? null);

      if (!accessResult.canAttempt) {
        setLoading(false);
        setQuestions([]);
        let confirmText = "OK";
        let onConfirmAction = () => router.push("/");
        if (!accessResult.isLoggedIn) {
          confirmText = "Sign Up";
          onConfirmAction = () => router.push("/signup");
        } else if (!accessResult.isPaidUser) {
          confirmText = "Upgrade Plan";
          onConfirmAction = () => router.push("/pricing");
        }
        setLimitModalState({
          isOpen: true,
          title: "Access Denied",
          message: accessResult.message,
          confirmText,
          cancelText: "Go Home",
          onConfirm: () => {
            onConfirmAction();
            setLimitModalState((prev) => ({ ...prev, isOpen: false }));
          },
        });
        return;
      }

      setLoading(true);
      try {
        // Use server-side PostgreSQL function for optimal performance
        // No client-side shuffling needed - database handles randomization
        const { data, error } = await supabase.rpc(
          "get_random_questions" as any,
          { question_limit: 20 }
        );

        if (error) throw new Error(error.message);

        if (!data || (data as Question[]).length === 0) {
          setQuestions([]);
          setError("No questions available for quiz.");
          setLoading(false);
          return;
        }

        if ((data as Question[]).length < 20) {
          console.warn(
            `Only ${
              (data as Question[]).length
            } questions available, expected 20`
          );
        }

        setQuestions(data as Question[]);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError((err as Error).message || "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    }

    performAccessCheckAndFetchData();
  }, []);

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

  const handleEndQuiz = () => {
    setIsConfirmEndQuizModalOpen(true);
  };

  const finishQuiz = async () => {
    if (!userId) {
      incrementLocalAttemptCount("standard");
    }

    setError(null); // Clear previous errors
    setLoading(true); // Show loading indicator

    const questionIds = questions.map((q) => q.id);
    const userAnswersForApi: Record<string, string> = {};
    for (const key in selectedAnswers) {
      userAnswersForApi[String(key)] = selectedAnswers[key];
    }

    try {
      const response = await fetch("/api/quiz-attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAnswers: userAnswersForApi,
          questionIds: questionIds,
          isTimed: false,
          timeTaken: null,
          isPractice: false,
          practiceType: null,
        }),
      });

      const result = await response.json(); // Always parse JSON

      if (!response.ok) {
        throw new Error(result.error || "Failed to save quiz attempt");
      }

      const attemptId = result.attemptId;

      if (attemptId) {
        router.push(`/results/${attemptId}`);
      } else {
        // Handle unauthenticated or non-persisted attempt
        if (
          typeof result.score === "number" &&
          typeof result.totalQuestions === "number"
        ) {
          setUnauthenticatedScore(result.score);
          setUnauthenticatedTotalQuestions(result.totalQuestions);
          setShowUnauthenticatedResults(true);
        } else {
          console.error(
            "API did not return score/totalQuestions for unauthenticated standard attempt:",
            result
          );
          setError(
            "Quiz finished, but there was an issue displaying your score."
          );
        }
      }
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      setError(err.message || "Failed to submit quiz. Please try again.");
      setShowUnauthenticatedResults(false);
    } finally {
      setLoading(false);
    }
  };

  if (limitModalState.isOpen) {
    return (
      <ConfirmationModal
        isOpen={limitModalState.isOpen}
        title={limitModalState.title}
        message={limitModalState.message}
        confirmText={limitModalState.confirmText}
        cancelText={limitModalState.cancelText}
        onConfirm={limitModalState.onConfirm}
        onClose={
          limitModalState.onClose ||
          (() => setLimitModalState((prev) => ({ ...prev, isOpen: false })))
        }
      />
    );
  }

  if (showUnauthenticatedResults) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Quiz Finished!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {unauthenticatedScore !== null &&
            unauthenticatedTotalQuestions !== null ? (
              <p className="text-2xl">
                You scored: {unauthenticatedScore} /{" "}
                {unauthenticatedTotalQuestions}
              </p>
            ) : (
              <p>Your score is being calculated...</p>
            )}
            <p className="text-sm text-muted-foreground">
              As you are not logged in, your results are not saved.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto"
            >
              Try Another Quiz
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
      </div>
    );
  }

  if (!isAccessChecked && loading) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Checking access...</p>
        </div>
      </div>
    );
  }

  if (loading && !showUnauthenticatedResults) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error && !showUnauthenticatedResults) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-3xl text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Return Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!currentQuestion && !loading && !error && !showUnauthenticatedResults) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-3xl text-center">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              There are no questions available for this quiz at the moment, or
              you may have encountered an issue.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Return Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (showUnauthenticatedResults) return null;

  if (!currentQuestion) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Preparing quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-3xl w-full space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <span className="text-sm text-muted-foreground">
            {selectedAnswers[currentQuestionIndex]
              ? "Answered"
              : "Not answered"}
          </span>
        </div>
        <Progress value={progress} className="h-2" />

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
          <CardFooter className="flex justify-between items-center">
            <Button
              variant="destructive"
              onClick={handleEndQuiz}
              className="mr-auto"
            >
              End Quiz
            </Button>
            <div className="flex gap-2">
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
                  ? "Finish Quiz"
                  : "Next Question"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {isConfirmEndQuizModalOpen && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setIsConfirmEndQuizModalOpen(false)}
          onConfirm={() => {
            finishQuiz();
            setIsConfirmEndQuizModalOpen(false);
          }}
          title="End Quiz?"
          message="Are you sure you want to end the quiz? Your current answers will be submitted, and you will be taken to the results page."
          confirmText="End Quiz"
          cancelText="Continue Quiz"
        />
      )}
    </div>
  );
}
