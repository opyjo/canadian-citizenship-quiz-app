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
import { incrementLocalAttemptCount } from "@/lib/quizLimits";
import ConfirmationModal from "@/components/confirmation-modal";
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

  useEffect(() => {
    async function performAccessCheckAndFetchData() {
      // Perform access check first
      const accessResult = await checkAttemptLimits("practice", supabase);
      setIsAccessChecked(true); // Mark access check as done

      if (!accessResult.canAttempt) {
        setLoading(false); // Stop loading indicator
        setQuestions([]); // Clear any potential questions
        //setError(accessResult.message); // Or use modal

        let confirmText = "OK";
        let onConfirmAction = () => router.push("/practice"); // Go back to practice options

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
          cancelText: "Go Home", // Changed cancel to Go Home or similar
          onConfirm: () => {
            onConfirmAction();
            setModalState({ ...modalState, isOpen: false });
          },
          onClose: () => {
            router.push("/"); // Default close action: go home
            setModalState({ ...modalState, isOpen: false });
          },
        });
        return; // Stop further execution if access is denied
      }

      // If access is granted, proceed to fetch quiz data
      setLoading(true); // Ensure loading is true before fetching actual questions
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          setUserId(userData.user.id);
        }

        const incorrect = searchParams.get("incorrect") === "true";
        const mode = searchParams.get("mode");
        const countParam = searchParams.get("count");

        if (incorrect) {
          setPracticeType("incorrect");

          if (!userData.user) {
            router.push("/auth");
            return;
          }

          // Fetch user's incorrect questions
          const { data: incorrectData, error: incorrectError } = await supabase
            .from("user_incorrect_questions")
            .select("question_id")
            .eq("user_id", userData.user.id);

          if (incorrectError) throw incorrectError;

          if (incorrectData && incorrectData.length > 0) {
            const questionIds = incorrectData.map((item) => item.question_id);

            // Fetch the actual questions
            const { data: questionData, error: questionError } = await supabase
              .from("questions")
              .select("*")
              .in("id", questionIds)
              .order("id")
              .limit(20);

            if (questionError) throw questionError;
            if (questionData) {
              setQuestions(questionData);
            } else {
              setQuestions([]);
            }
          } else {
            // No incorrect questions found for this user
            setError(
              "Congratulations! You have no incorrect questions to practice. Well done!"
            );
            setQuestions([]);
            return;
          }
        } else if (mode === "random" && countParam) {
          setPracticeType("random");
          const count = parseInt(countParam, 10);

          if (isNaN(count) || count <= 0) {
            setError(
              "Invalid number of questions specified for random practice."
            );
            setQuestions([]);
            router.push("/practice");
            return;
          }

          // Fetch all question IDs
          const { data: allQuestionIds, error: idError } = await supabase
            .from("questions")
            .select("id");

          if (idError) throw idError;

          if (allQuestionIds && allQuestionIds.length > 0) {
            const shuffledIds = allQuestionIds
              .map((q) => q.id)
              .sort(() => 0.5 - Math.random());
            const selectedIds = shuffledIds.slice(0, count);

            if (selectedIds.length > 0) {
              // Fetch the actual questions by selected IDs
              const { data: questionData, error: questionError } =
                await supabase
                  .from("questions")
                  .select("*")
                  .in("id", selectedIds);

              if (questionError) throw questionError;

              if (questionData) {
                // Re-shuffle here to ensure the presentation order is random, as .in() might return them ordered by ID
                const finalShuffledQuestions = [...questionData].sort(
                  () => 0.5 - Math.random()
                );
                setQuestions(finalShuffledQuestions);
              } else {
                setQuestions([]);
              }
            } else {
              setError("No questions available to select for random practice.");
              setQuestions([]);
            }
          } else {
            setError("No questions found in the database for random practice.");
            setQuestions([]);
          }
        } else {
          // No valid practice type specified
          router.push("/practice");
          return;
        }
      } catch (err: any) {
        console.error("Error fetching questions:", err);
        setError(err.message || "Failed to load practice questions");
      } finally {
        setLoading(false);
        setStartTime(Date.now());
      }
    }

    performAccessCheckAndFetchData();
  }, [supabase, searchParams, router]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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
    if (process.env.NODE_ENV === "development") {
      console.log("[PracticeQuizPage] getResultData called");
    }
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
      console.log("[PracticeQuizPage] resultData prepared:", results);
      return results;
    } catch (error) {
      console.error("[PracticeQuizPage] Error in getResultData:", error);
      setError("Error preparing quiz results. Please try again."); // Update error state
      throw error; // Re-throw to stop finishQuiz if critical
    }
  };

  const finishQuiz = async () => {
    if (process.env.NODE_ENV === "development") {
      console.log("[PracticeQuizPage] finishQuiz called");
    }
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
      console.log(
        "[PracticeQuizPage] User is not logged in. Incrementing local practice attempt count."
      );
      incrementLocalAttemptCount("practice");
    }

    if (userId) {
      console.log(
        "[PracticeQuizPage] User is logged in. Processing practice results for user_incorrect_questions table.",
        { userId, practiceType }
      );
      try {
        // Logic for questions the user got wrong IN THIS SESSION
        const newlyIncorrectQuestions = localResultData.questions
          .filter((q: any) => !q.is_correct && q.selected_option !== undefined)
          .map((q: any) => ({
            user_id: userId,
            question_id: q.id,
          }));

        if (newlyIncorrectQuestions.length > 0) {
          console.log(
            "[PracticeQuizPage] Upserting newly incorrect questions:",
            newlyIncorrectQuestions
          );
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
          } else {
            console.log(
              "[PracticeQuizPage] Successfully upserted newly incorrect questions."
            );
          }
        } else {
          console.log(
            "[PracticeQuizPage] No new incorrect questions in this session."
          );
        }

        // New logic: If this was a session for practicing incorrect questions,
        // remove questions they got right from the user_incorrect_questions table.
        if (practiceType === "incorrect") {
          // Make sure practiceType reflects the mode
          const correctlyAnsweredInThisSession = localResultData.questions
            .filter((q: any) => q.is_correct && q.selected_option !== undefined)
            .map((q: any) => q.id);

          if (correctlyAnsweredInThisSession.length > 0) {
            console.log(
              "[PracticeQuizPage] Removing correctly answered questions from user_incorrect_questions table:",
              correctlyAnsweredInThisSession
            );
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
            } else {
              console.log(
                "[PracticeQuizPage] Successfully removed correctly answered questions."
              );
            }
          }
        }
      } catch (errorLogging) {
        console.error(
          "[PracticeQuizPage] Error updating user_incorrect_questions table:",
          errorLogging
        );
      }
    } else {
      console.log(
        "[PracticeQuizPage] User not logged in. Skipping save/update of user data (user_incorrect_questions)."
      );
    }
    // No explicit redirect here if unauthenticated or error, as those states render different UI.
  };

  if (showUnauthenticatedResults) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
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
      </div>
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
        onClose={
          modalState.onClose ||
          (() => setModalState({ ...modalState, isOpen: false }))
        }
      />
    );
  }

  if (!isAccessChecked && loading && !showUnauthenticatedResults) {
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
          <p className="text-lg">Loading practice questions...</p>
        </div>
      </div>
    );
  }

  if (error && !showUnauthenticatedResults) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
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
      </div>
    );
  }

  if (!currentQuestion && !loading && !error && !showUnauthenticatedResults) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
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
    </div>
  );
}

// Loading fallback component
function PracticeQuizLoading() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <p className="text-lg">Loading practice quiz...</p>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function PracticeQuizPage() {
  return (
    <Suspense fallback={<PracticeQuizLoading />}>
      <PracticeQuizContent />
    </Suspense>
  );
}
