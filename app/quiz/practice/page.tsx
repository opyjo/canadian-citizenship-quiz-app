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
    console.log("[PracticeQuizPage] getResultData called");
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
    console.log("[PracticeQuizPage] finishQuiz called");
    let resultData;
    try {
      resultData = getResultData();
    } catch (e) {
      // Error already logged and setError called in getResultData
      return; // Stop execution if getResultData failed
    }

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
      isTimed: false, // Practice quizzes are not timed in this context
      timeTaken: resultData.timeTaken, // getResultData calculates this
      isPractice: true,
      practiceType: practiceType, // From component state (e.g., "incorrect", "random")
      category: null, // Category is no longer used for practice mode attempts
    };
    console.log(
      "[PracticeQuizPage] resultData prepared for submission:",
      payload
    );

    let attemptIdToRedirect: string | null = null;

    try {
      // This API call is for both authenticated and unauthenticated users initially.
      // The API route itself should handle auth and save differently if needed,
      // or we rely on userId being null/present in the payload for the API to distinguish.
      // For now, the API call structure is kept as it was.
      const response = await fetch("/api/quiz-attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to save practice quiz attempt"
        );
      }

      const result = await response.json();
      attemptIdToRedirect = result.attemptId; // Store attemptId for redirection

      // If no attemptId is received, it's an issue, but we might still want to update local counts.
      if (!attemptIdToRedirect) {
        console.warn(
          "[PracticeQuizPage] No attempt ID received from API for practice quiz, but proceeding with local/UI updates."
        );
      }
    } catch (err: any) {
      console.error("[PracticeQuizPage] Error submitting practice quiz:", err);
      setError(
        err.message || "Failed to submit practice quiz. Please try again."
      );
      // Even if API submission fails, if it was an unauth user, we might still want to count the attempt locally.
      // Or, decide not to count if API fails. For now, let's count it if an attempt was made.
    }

    // Increment local count for unauthenticated users OR if userId was not set (should be equivalent)
    // This should happen regardless of API success if an attempt was made by an unauth user.
    if (!userId) {
      console.log(
        "[PracticeQuizPage] User is not logged in. Incrementing local practice attempt count."
      );
      incrementLocalAttemptCount("practice");
    }

    // Logic for updating user_incorrect_questions if user is logged in (remains unchanged)
    if (userId) {
      console.log(
        "[PracticeQuizPage] User is logged in. Processing practice results for user_incorrect_questions table.",
        { userId, practiceType }
      );
      try {
        // Logic for questions the user got wrong IN THIS SESSION
        const newlyIncorrectQuestions = resultData.questions
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
          const correctlyAnsweredInThisSession = resultData.questions
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
      } catch (error) {
        console.error(
          "[PracticeQuizPage] Error updating user_incorrect_questions table:",
          error
        );
      }
    } else {
      // This log was already here, confirming user is not logged in.
      console.log(
        "[PracticeQuizPage] User is not logged in. Skipping save/update of user data (user_incorrect_questions)."
      );
    }

    // Finally, redirect if an attemptId was successfully obtained
    if (attemptIdToRedirect) {
      router.push(`/results/${attemptIdToRedirect}`);
    } else if (!error) {
      // If there was no attemptId but also no specific API submission error caught earlier,
      // it implies a potential issue with the API not returning an ID.
      // We might want to redirect to a generic page or show an inline message.
      // For now, if no explicit error was set, and no ID, let's go to practice options.
      // This might happen if the API call was successful (200 OK) but didn't return an attemptId.
      console.warn(
        "[PracticeQuizPage] No attemptId from API and no explicit error. Routing to practice options."
      );
      router.push("/practice");
    }
    // If 'error' state is set, the page will render the error message, so no explicit redirect here for that case.
  };

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

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading practice questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  if (!currentQuestion && !loading && !error) {
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
