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
  type QuizMode,
} from "@/lib/quizLimits";
import Link from "next/link";

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
      setUserId(authUser?.id || null);

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
            setLimitModalState({ ...limitModalState, isOpen: false });
          },
          onClose: () => {
            router.push("/");
            setLimitModalState({ ...limitModalState, isOpen: false });
          },
        });
        return;
      }

      setLoading(true);
      try {
        const { data: idObjects, error: idError } = await supabase
          .from("questions")
          .select("id");
        if (idError) throw new Error(idError.message);
        if (!idObjects || idObjects.length === 0)
          throw new Error("No question IDs found.");

        let questionIds = idObjects.map((item) => item.id);
        for (let i = questionIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [questionIds[i], questionIds[j]] = [questionIds[j], questionIds[i]];
        }
        const selectedIds = questionIds.slice(0, 20);

        if (selectedIds.length === 0) {
          setQuestions([]);
          setError("Not enough questions to start a quiz.");
          setLoading(false);
          return;
        }

        const { data, error: questionsFetchError } = await supabase
          .from("questions")
          .select("*")
          .in("id", selectedIds);
        if (questionsFetchError) throw new Error(questionsFetchError.message);

        if (data) {
          const questionMap = new Map(data.map((q) => [q.id, q]));
          const orderedQuestions = selectedIds
            .map((id) => questionMap.get(id))
            .filter(Boolean) as Question[];
          setQuestions(orderedQuestions);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError((err as Error).message || "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    }

    performAccessCheckAndFetchData();
  }, [supabase, router]);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save quiz attempt");
      }

      const result = await response.json();
      const attemptId = result.attemptId;

      if (attemptId) {
        router.push(`/results/${attemptId}`);
      } else {
        throw new Error("No attempt ID received from API");
      }
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      setError(err.message || "Failed to submit quiz. Please try again.");
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
          (() => setLimitModalState({ ...limitModalState, isOpen: false }))
        }
      />
    );
  }

  if (!isAccessChecked && loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Checking access...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-3xl">
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

  if (!currentQuestion && !loading && isAccessChecked) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-3xl">
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
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="max-w-3xl w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
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

      <ConfirmationModal
        isOpen={isConfirmEndQuizModalOpen}
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
    </div>
  );
}
