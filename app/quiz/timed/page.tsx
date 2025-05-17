"use client";

import { useState, useEffect, useCallback } from "react";
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
import Timer from "@/components/timer";
import ConfirmationModal from "@/components/confirmation-modal";

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  answer_explanation: string | null;
  category: string | null;
}

export default function TimedQuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]);
  const [quizActive, setQuizActive] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(60 * 15); // 15 minutes in seconds
  const [quizFinished, setQuizFinished] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const TIME_LIMIT = 60 * 15; // 15 minutes in seconds

  const handleEndQuiz = useCallback(() => {
    setIsConfirmModalOpen(true);
  }, []);

  const finishQuiz = useCallback(async () => {
    if (quizFinished) return;
    setQuizFinished(true);
    setQuizActive(false);
    // Calculate time taken. Ensure startTime was set when the quiz began.
    const timeTakenSeconds =
      startTime > 0
        ? Math.floor((Date.now() - startTime) / 1000)
        : TIME_LIMIT - timeRemaining;

    const questionIds = originalQuestions.map((q) => q.id);

    // Ensure selectedAnswers keys are strings
    const userAnswersForApi: Record<string, string> = {};
    for (const key in selectedAnswers) {
      userAnswersForApi[String(key)] = selectedAnswers[key];
    }

    // setLoading(true); // Optional: indicate loading
    // setError(null);

    try {
      const response = await fetch("/api/quiz-attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAnswers: userAnswersForApi,
          questionIds: questionIds,
          isTimed: true,
          timeTaken: timeTakenSeconds,
          isPractice: false, // Assuming timed quiz is not a practice quiz by default
          practiceType: null,
          category: null, // Or a specific category if applicable to all timed quizzes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save timed quiz attempt");
      }

      const result = await response.json();
      const attemptId = result.attemptId;

      if (attemptId) {
        router.push(`/results/${attemptId}`);
      } else {
        throw new Error("No attempt ID received from API for timed quiz");
      }
    } catch (err: any) {
      console.error("Error submitting timed quiz:", err);
      setError(err.message || "Failed to submit timed quiz. Please try again.");
      // Optional: redirect to home or show error inline
    } finally {
      // setLoading(false);
    }

    // The existing logic for saving incorrect questions if userId is present can be kept or refactored.
    // For now, it's outside the new API call flow but was part of the original function.
    // Consider if this should also move to the API route or be triggered differently.
    if (userId) {
      let newScore = 0;
      const incorrectQs: {
        question_id: number;
        user_answer: string;
        correct_answer: string;
        question_text: string;
      }[] = [];

      questions.forEach((question, index) => {
        const userAnswer = selectedAnswers[index];
        if (
          userAnswer &&
          question.correct_option.toLowerCase() === userAnswer.toLowerCase()
        ) {
          newScore++;
        } else if (userAnswer) {
          const qIdAsNumber = Number(question.id);
          if (isNaN(qIdAsNumber)) {
            console.error(
              `Invalid question.id: ${question.id} cannot be converted to a number.`
            );
            return;
          }
          incorrectQs.push({
            question_id: qIdAsNumber,
            user_answer: userAnswer,
            correct_answer: question.correct_option,
            question_text: question.question_text,
          });
        }
      });

      try {
        // This was the old way of saving, the API route now handles the primary attempt saving.
        // The quiz_attempts insert here is now redundant if the API call above succeeds.
        // await supabaseClient.from("quiz_attempts").insert({ ... });

        if (incorrectQs.length > 0) {
          await supabaseClient.from("user_incorrect_questions").upsert(
            incorrectQs.map((iq) => ({ ...iq, user_id: userId })), // ensure user_id is part of the object
            {
              onConflict: "user_id, question_id",
              ignoreDuplicates: false,
            }
          );
        }
      } catch (dbError) {
        console.error("Error saving user incorrect questions:", dbError);
      }
    }
  }, [
    quizFinished,
    setQuizActive,
    startTime,
    timeRemaining,
    originalQuestions,
    selectedAnswers,
    router,
    userId, // Added userId here as it's used in the latter part
    questions, // Added questions here as it's used for score calculation for incorrectQs
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

  const handleTimeUp = () => {
    finishQuiz();
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Fetch all question IDs
        const { data: idObjects, error: idError } = await supabaseClient
          .from("questions")
          .select("id");

        if (idError) {
          console.error("Supabase error fetching IDs (timed):", idError);
          throw new Error(idError.message);
        }

        if (!idObjects || idObjects.length === 0) {
          throw new Error("No question IDs found (timed).");
        }

        // Ensure questionIds are numbers, assuming item.id from DB is number
        let questionIds = idObjects.map((item: { id: number }) => item.id);

        // 2. Shuffle the IDs (Fisher-Yates shuffle algorithm)
        for (let i = questionIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [questionIds[i], questionIds[j]] = [questionIds[j], questionIds[i]];
        }

        // 3. Take the first 20 IDs (or fewer if not enough questions)
        const selectedIds = questionIds.slice(0, 20);

        if (selectedIds.length === 0) {
          setQuestions([]);
          setError("Not enough questions to start a timed quiz.");
          setLoading(false);
          return;
        }

        // 4. Fetch the full data for these 20 questions
        const { data, error } = await supabaseClient
          .from("questions")
          .select("*")
          .in("id", selectedIds);

        if (error) {
          console.error(
            "Supabase error fetching questions by ID (timed):",
            error
          );
          throw new Error(error.message);
        }

        if (data) {
          const questionMap = new Map(data.map((q: Question) => [q.id, q]));
          const orderedQuestions = selectedIds
            .map((id: number) => questionMap.get(id)) // id is now number
            .filter(Boolean) as Question[];
          setQuestions(orderedQuestions);
          setOriginalQuestions(orderedQuestions);
          setError(null);
        } else {
          setQuestions([]);
          setError("No questions returned for the timed quiz.");
        }
      } catch (err: any) {
        console.error("Error in fetchData (timed):", err);
        setError(err.message || "Failed to load questions for timed quiz.");
        setQuestions([]);
      } finally {
        setLoading(false);
        setStartTime(Date.now());
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
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

  if (!currentQuestion) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              There are no questions available at this time. Please try again
              later.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Return Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-3xl w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <Timer initialTime={TIME_LIMIT} onTimeUp={handleTimeUp} />
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
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          finishQuiz();
          setIsConfirmModalOpen(false);
        }}
        title="End Quiz?"
        message="Are you sure you want to end the quiz? Your current answers will be submitted, and you will be taken to the results page."
        confirmText="End Quiz"
        cancelText="Continue Quiz"
      />
    </div>
  );
}

// Sample questions for demo purposes when Supabase is not set up
