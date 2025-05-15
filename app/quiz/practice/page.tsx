"use client";

import { useState, useEffect } from "react";
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

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

export default function PracticeQuizPage() {
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

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Check if user is authenticated
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          setUserId(userData.user.id);
        }

        // Get query parameters
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
            // No incorrect questions found
            setError(
              "You don't have any incorrect questions to practice. Take some quizzes first!"
            );
            setQuestions([]);
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

        // For demo purposes, load sample questions if Supabase is not set up
        setQuestions(getSampleQuestions());
      } finally {
        setLoading(false);
        setStartTime(Date.now());
      }
    }

    fetchInitialData();
  }, [supabase, searchParams, router, userId]);

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
      // Assuming getResultData structures questions with selected_option, and we want to map it to the API's expected userAnswers format
      // The key for userAnswers should be the original index of the question as a string.
      if (q.selected_option !== undefined) {
        userAnswersForApi[String(index)] = q.selected_option;
      }
    });

    // setLoading(true); // Optional
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
          isTimed: false, // Practice quiz is not timed in the same way as /quiz/timed
          timeTaken: resultData.timeTaken, // getResultData calculates a timeTaken
          isPractice: true,
          practiceType: resultData.practiceType, // Get practiceType from resultData
          category:
            practiceType === "category" ? searchParams.get("category") : null, // Pass category if it was a category practice
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to save practice quiz attempt"
        );
      }

      const result = await response.json();
      const attemptId = result.attemptId;

      if (attemptId) {
        router.push(`/results/${attemptId}`);
      } else {
        throw new Error("No attempt ID received from API for practice quiz");
      }
    } catch (err: any) {
      console.error("[PracticeQuizPage] Error submitting practice quiz:", err);
      setError(
        err.message || "Failed to submit practice quiz. Please try again."
      );
      // Optional: redirect to home or show error inline
    } finally {
      // setLoading(false);
    }

    // Existing logic for updating user_incorrect_questions if user is logged in
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
      console.log(
        "[PracticeQuizPage] User is not logged in. Skipping save/update of user data."
      );
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading practice questions...</p>
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
            <Button onClick={() => router.push("/practice")}>
              Return to Practice
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no questions available for this practice session.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/practice")}>
              Return to Practice
            </Button>
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

// Sample questions for demo purposes when Supabase is not set up
function getSampleQuestions(): Question[] {
  return [
    {
      id: 1,
      question_text:
        "When must a federal election be held according to legislation passed by parliament?",
      option_a: "When the king wants to replace the prime minister",
      option_b: "Within four years of the most recent election",
      option_c: "Within 5 years of the last election",
      option_d:
        "The prime minister can call the election any time at his own will",
      correct_option: "b",
    },
    {
      id: 2,
      question_text:
        "Which of the following is the federal government responsible for?",
      option_a: "Highways",
      option_b: "Natural resources",
      option_c: "Education",
      option_d: "Interprovincial trade and communications",
      correct_option: "d",
    },
    // Add more sample questions with explanations and categories
    {
      id: 3,
      question_text:
        "What was the name of the new country formed at confederation?",
      option_a: "Britain",
      option_b: "Canada",
      option_c: "Canadian Confederation",
      option_d: "Dominion of Canada",
      correct_option: "d",
    },
    {
      id: 4,
      question_text: "Where do more than half of the people in Canada live?",
      option_a: "Coastal Pacific",
      option_b: "Atlantic Canada",
      option_c: "Prairies",
      option_d: "Central Canada",
      correct_option: "d",
    },
    {
      id: 5,
      question_text: "Who brought Quebec into confederation?",
      option_a: "Sir Lewis Hippoly La Fontaine",
      option_b: "Sir George-Étienne Cartier",
      option_c: "Sir Wilfried Laurier",
      option_d: "Sir John Alexander Macdonald",
      correct_option: "b",
    },
  ];
}
