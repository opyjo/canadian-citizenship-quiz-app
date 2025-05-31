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
import { incrementLocalAttemptCount } from "@/lib/quizLimits";
import { checkAttemptLimits } from "@/lib/quizLimits";

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
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
  const [isAccessChecked, setIsAccessChecked] = useState(false);
  const [modalState, setModalState] = useState<{
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

  // New state for unauthenticated results
  const [showUnauthenticatedResults, setShowUnauthenticatedResults] =
    useState(false);
  const [unauthenticatedScore, setUnauthenticatedScore] = useState<
    number | null
  >(null);
  const [unauthenticatedTotalQuestions, setUnauthenticatedTotalQuestions] =
    useState<number | null>(null);

  const TIME_LIMIT = 60 * 15; // 15 minutes in seconds

  const handleEndQuiz = useCallback(() => {
    setIsConfirmModalOpen(true);
  }, []);

  const finishQuiz = useCallback(async () => {
    if (quizFinished) return;
    setQuizFinished(true);
    setQuizActive(false);
    setError(null); // Clear previous errors
    setLoading(true); // Show loading indicator

    const timeTakenSeconds =
      startTime > 0
        ? Math.floor((Date.now() - startTime) / 1000)
        : TIME_LIMIT - timeRemaining;

    const questionIds = originalQuestions.map((q) => q.id);
    const userAnswersForApi: Record<string, string> = {};
    for (const key in selectedAnswers) {
      userAnswersForApi[String(key)] = selectedAnswers[key];
    }

    let attemptIdToRedirect: string | null = null;

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
          isPractice: false,
          practiceType: null,
        }),
      });

      const result = await response.json(); // Always parse JSON

      if (!response.ok) {
        throw new Error(result.error || "Failed to save timed quiz attempt");
      }

      attemptIdToRedirect = result.attemptId;

      if (attemptIdToRedirect) {
        router.push(`/results/${attemptIdToRedirect}`);
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
            "API did not return score/totalQuestions for unauthenticated timed attempt:",
            result
          );
          setError(
            "Quiz finished, but there was an issue displaying your score."
          );
        }
      }
    } catch (err: any) {
      console.error("Error submitting timed quiz:", err);
      setError(err.message || "Failed to submit timed quiz. Please try again.");
      setShowUnauthenticatedResults(false);
    } finally {
      setLoading(false);
    }

    // Increment local count for unauthenticated users - this happens regardless of API success for unauth users
    if (!userId) {
      console.log(
        "[TimedQuizPage] User is not logged in. Incrementing local timed attempt count."
      );
      incrementLocalAttemptCount("timed");
    }

    // Existing logic for saving incorrect questions if userId is present
    // This should ideally only run if the main attempt submission was successful OR if it's an unauth user
    // For simplicity, keeping it as is, but it might try to run even if API errored out for auth user.
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
        if (incorrectQs.length > 0) {
          await supabaseClient.from("user_incorrect_questions").upsert(
            incorrectQs.map((iq) => ({ ...iq, user_id: userId })),
            {
              onConflict: "user_id, question_id",
              ignoreDuplicates: false,
            }
          );
        }
      } catch (dbError) {
        console.error("Error saving user incorrect questions:", dbError);
      }
    } else {
      console.log(
        "[TimedQuizPage] User not logged in. Skipping update of user_incorrect_questions."
      );
    }

    // If 'error' state is set, the page will render the error message.
    // If showUnauthenticatedResults is true, that UI will be shown.
    // If attemptIdToRedirect is set, navigation will occur.
    // If none of the above and no error, it implies an unhandled case (e.g. API ok but no attemptId and no score)
    // which is covered by the setError in the catch or the specific else block.
  }, [
    quizFinished,
    setQuizActive,
    startTime,
    timeRemaining,
    originalQuestions,
    selectedAnswers,
    router,
    userId,
    questions,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizActive && timeRemaining > 0 && !showUnauthenticatedResults) {
      // Pause timer if showing results
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (
      timeRemaining === 0 &&
      quizActive &&
      !showUnauthenticatedResults
    ) {
      finishQuiz();
    }
    return () => clearInterval(timer);
  }, [quizActive, timeRemaining, finishQuiz, showUnauthenticatedResults]);

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
    async function performAccessCheckAndFetchData() {
      // Perform access check first
      const accessResult = await checkAttemptLimits("timed", supabaseClient);
      setIsAccessChecked(true); // Mark access check as done

      if (!accessResult.canAttempt) {
        setLoading(false); // Stop loading indicator
        setQuestions([]); // Clear any potential questions

        let confirmText = "OK";
        let onConfirmAction = () => router.push("/"); // Go back to home

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
          confirmText: confirmText,
          cancelText: "Go Home",
          onConfirm: () => {
            onConfirmAction();
            setModalState({ ...modalState, isOpen: false });
          },
          onClose: () => {
            router.push("/");
            setModalState({ ...modalState, isOpen: false });
          },
        });
        return; // Stop further execution if access is denied
      }

      // If access is granted, proceed to fetch quiz data
      setLoading(true); // Ensure loading is true before fetching actual questions
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

        let questionIds = idObjects.map((item: { id: number }) => item.id);
        for (let i = questionIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [questionIds[i], questionIds[j]] = [questionIds[j], questionIds[i]];
        }
        const selectedIds = questionIds.slice(0, 20);

        if (selectedIds.length === 0) {
          setQuestions([]);
          setError("Not enough questions to start a timed quiz.");
          setLoading(false); // Ensure loading is set to false here
          return;
        }

        const { data, error } = await supabaseClient
          .from("questions")
          .select(
            "id, question_text, option_a, option_b, option_c, option_d, correct_option"
          )
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
            .map((id: number) => questionMap.get(id))
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
        setStartTime(Date.now()); // Set start time only if quiz is loaded and access granted
      }
    }

    performAccessCheckAndFetchData();
  }, [router]); // Simplified dependencies, supabaseClient is stable, searchParams not used here

  if (showUnauthenticatedResults) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Timed Quiz Finished!</CardTitle>
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
              Try Another Timed Quiz
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

  // Conditional rendering for the limit modal
  if (modalState.isOpen) {
    return (
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
        onClose={
          modalState.onClose ||
          (() => setModalState({ ...modalState, isOpen: false }))
        }
      />
    );
  }

  // Initial loading state for access check
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

  // Main loading state for fetching questions after access check
  if (loading && !showUnauthenticatedResults) {
    // Don't show loading if showing results
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
    // Don't show error if showing results, or if error is for results itself
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
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

  // Fallback if no questions are loaded and not in loading/error state
  if (!currentQuestion && !loading && !error && !showUnauthenticatedResults) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
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

  // If quiz is finished via unauth path, but questions somehow still loaded, this will prevent quiz UI
  if (showUnauthenticatedResults) return null;

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
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
