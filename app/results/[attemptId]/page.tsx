"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // Import useParams
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import supabaseClient from "@/lib/supabase-client";
import { CheckCircle, XCircle, AlertCircle, Clock, Info } from "lucide-react";

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

// Define a type for the quiz attempt data fetched from Supabase
interface QuizAttempt {
  id: string;
  user_answers: Record<string, string>;
  question_ids: number[];
  is_timed: boolean;
  time_taken_seconds: number | null;
  is_practice: boolean;
  practice_type: string | null;
  category: string | null; // Category of the quiz attempt if applicable
  created_at: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTimed, setIsTimed] = useState(false);
  const [timeTaken, setTimeTaken] = useState<number | null>(null); // in seconds
  const [isPractice, setIsPractice] = useState(false);
  const [practiceType, setPracticeType] = useState<string | null>(null);
  const [quizCategory, setQuizCategory] = useState<string | null>(null); // Renamed to avoid conflict with question.category
  const supabase = supabaseClient;

  useEffect(() => {
    async function loadResults() {
      if (!attemptId) {
        setLoading(false);
        setError("Attempt ID not found in URL.");
        // router.push("/"); // Optionally redirect
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // 1. Fetch the quiz attempt data
        const { data: attemptData, error: attemptError } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("id", attemptId)
          .single();

        if (attemptError) throw attemptError;
        if (!attemptData) throw new Error("Quiz attempt not found.");

        const typedAttemptData = attemptData as QuizAttempt;

        setUserAnswers(typedAttemptData.user_answers || {}); // Ensure userAnswers is an object
        setIsTimed(typedAttemptData.is_timed || false);
        setTimeTaken(typedAttemptData.time_taken_seconds);
        setIsPractice(typedAttemptData.is_practice || false);
        setPracticeType(typedAttemptData.practice_type);
        setQuizCategory(typedAttemptData.category); // Category for the overall quiz/practice session

        // 2. Fetch the questions based on IDs from the attempt
        let fetchedQuestions: Question[] | null = null;
        let fetchError: any = null;

        if (
          typedAttemptData.question_ids &&
          typedAttemptData.question_ids.length > 0
        ) {
          const { data: questionData, error: questionsError } = await supabase
            .from("questions")
            .select(
              "id, question_text, option_a, option_b, option_c, option_d, correct_option"
            )
            .in("id", typedAttemptData.question_ids);

          fetchError = questionsError;

          if (questionData) {
            const questionMap = new Map(
              questionData.map((q: Question) => [q.id, q])
            );
            fetchedQuestions = typedAttemptData.question_ids
              .map((id: number) => questionMap.get(id))
              .filter(Boolean) as Question[];
          }
        } else {
          console.warn("No question IDs found in the quiz attempt.");
        }

        if (fetchError) {
          throw new Error(fetchError.message || "Failed to fetch questions.");
        }

        if (fetchedQuestions && fetchedQuestions.length > 0) {
          setQuestions(fetchedQuestions);
        } else {
          console.warn(
            "Could not fetch specific questions by ID, or no questions were associated with the attempt."
          );
          // Do not fall back to sample questions here, as this page is for specific attempts.
          // setError("Failed to load questions for this quiz attempt. Critical data missing.");
          // Forcing an error state if questions can't be loaded for a valid attempt.
          if (!fetchError)
            setError(
              "Failed to load questions for this quiz attempt. Questions not found or IDs missing."
            );
        }
      } catch (err: any) {
        console.error("Error loading results:", err);
        setError(
          err.message || "Failed to load quiz results. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [attemptId, router, supabase]);

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p>Loading results...</p>
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

  // Guard against rendering if questions are not loaded, which can happen if attemptId was invalid or data missing.
  if (questions.length === 0 && !loading) {
    // This check might be redundant if error state is properly set above,
    // but good as a safeguard before score calculation.
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-orange-600">No Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              No questions were loaded for this quiz attempt. This might be due
              to an invalid attempt ID or missing data.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Return Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Calculate score
  // Assuming userAnswers is an object keyed by original question index (0-based) like {"0": "A", "1": "C"}
  // And questions array is ordered by original question order.
  const correctAnswersCount = questions.filter(
    (q, index) => userAnswers[String(index)]?.toUpperCase() === q.correct_option
  ).length;

  const totalQuestions = questions.length;
  const scorePercentage =
    totalQuestions > 0
      ? Math.round((correctAnswersCount / totalQuestions) * 100)
      : 0;

  // For non-practice quizzes, determine pass/fail. For practice, it's neutral.
  const passed = !isPractice && correctAnswersCount >= 15;
  const failed = !isPractice && correctAnswersCount < 15;

  // Format time taken
  const formattedTimeTaken = timeTaken
    ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`
    : "Not recorded";

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="w-full flex justify-start mb-4">
          <Button onClick={() => router.push("/")} variant="outline">
            Return to Home
          </Button>
        </div>
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Quiz Results</CardTitle>
              {isPractice && (
                <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                  {practiceType === "category"
                    ? quizCategory // Use quizCategory state for the practice category
                    : "Incorrect Questions"}{" "}
                  Practice
                </div>
              )}
              {isTimed && (
                <div className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Timed Quiz
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg">
              <div
                className={`text-5xl font-bold ${
                  isPractice
                    ? "text-blue-600"
                    : passed
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {correctAnswersCount} / {totalQuestions}
              </div>
              <p
                className={`text-xl font-medium ${
                  isPractice
                    ? "text-blue-600"
                    : passed
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Score: {scorePercentage}%
              </p>
              {!isPractice ? ( // Only show pass/fail message for non-practice quizzes
                passed ? (
                  <p className="text-lg text-green-700">
                    You passed! Congratulations!
                  </p>
                ) : (
                  <p className="text-lg text-red-700">
                    Failed. You need at least 15 correct answers (75%) to pass.
                    Try again!
                  </p>
                )
              ) : (
                <p className="text-lg text-gray-700">
                  Practice Session Complete
                </p>
              )}
            </div>
            {isPractice &&
              practiceType === "incorrect" &&
              scorePercentage === 100 && (
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-semibold">
                    Great job! You've correctly answered all questions in this
                    practice session.
                  </p>
                  <p className="text-sm text-green-600">
                    These questions should now be removed from your incorrect
                    questions list.
                  </p>
                </div>
              )}

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Questions</TabsTrigger>
                <TabsTrigger value="correct">
                  Correct ({correctAnswersCount})
                </TabsTrigger>
                <TabsTrigger value="incorrect">
                  Incorrect ({totalQuestions - correctAnswersCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4">
                {questions.map((question, index) => {
                  // userAnswers is keyed by index string
                  const userAnswerKey = String(index);
                  const userAnswer = userAnswers[userAnswerKey];
                  const isCorrect =
                    userAnswer?.toUpperCase() === question.correct_option;
                  return (
                    <QuestionReview
                      key={question.id} // Use question.id for key if available and unique
                      question={question}
                      userAnswer={userAnswer}
                      isCorrect={isCorrect}
                      questionNumber={index + 1}
                      reviewContext="all"
                    />
                  );
                })}
              </TabsContent>

              <TabsContent value="correct" className="space-y-4 mt-4">
                {questions
                  .filter((q, index) => {
                    const userAnswerKey = String(index);
                    return (
                      userAnswers[userAnswerKey]?.toUpperCase() ===
                      q.correct_option
                    );
                  })
                  .map((question) => {
                    const originalIndex = questions.indexOf(question);
                    const userAnswerKey = String(originalIndex);
                    return (
                      <QuestionReview
                        key={question.id}
                        question={question}
                        userAnswer={userAnswers[userAnswerKey]}
                        isCorrect={true}
                        questionNumber={originalIndex + 1}
                        reviewContext="correct"
                      />
                    );
                  })}
              </TabsContent>

              <TabsContent value="incorrect" className="space-y-4 mt-4">
                {questions
                  .filter((q, index) => {
                    const userAnswerKey = String(index);
                    return (
                      userAnswers[userAnswerKey] !== undefined &&
                      userAnswers[userAnswerKey]?.toUpperCase() !==
                        q.correct_option
                    );
                  })
                  .map((question) => {
                    const originalIndex = questions.indexOf(question);
                    const userAnswerKey = String(originalIndex);
                    return (
                      <QuestionReview
                        key={question.id}
                        question={question}
                        userAnswer={userAnswers[userAnswerKey]}
                        isCorrect={false}
                        questionNumber={originalIndex + 1}
                        reviewContext="incorrect"
                      />
                    );
                  })}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              Return Home
            </Button>
            {isPractice ? (
              <Link href="/practice">
                <Button>Back to Practice</Button>
              </Link>
            ) : isTimed ? (
              <Link href="/quiz/timed">
                <Button>Try Another Timed Quiz</Button>
              </Link>
            ) : (
              // Default fallback, consider if /quiz is the right general "try again"
              <Link href="/quiz">
                <Button>Try Another Quiz</Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function QuestionReview({
  question,
  userAnswer,
  isCorrect,
  questionNumber,
  reviewContext,
}: {
  question: Question;
  userAnswer: string | undefined;
  isCorrect: boolean;
  questionNumber: number;
  reviewContext: "all" | "correct" | "incorrect";
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-2">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            isCorrect
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isCorrect ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <p className="font-medium">Question {questionNumber}</p>
            {question.category && (
              <span className="text-xs text-muted-foreground px-2 py-1 bg-gray-100 rounded-full">
                {question.category}
              </span>
            )}
          </div>
          <p>{question.question_text}</p>
        </div>
      </div>

      <div className="space-y-2 pl-8">
        {["a", "b", "c", "d"].map((option) => {
          const optionValue = question[
            `option_${option}` as keyof Question
          ] as string;
          const isThisOptionTheUserAnswer =
            userAnswer?.toUpperCase() === option.toUpperCase();
          const isThisOptionTheCorrectAnswer =
            question.correct_option === option.toUpperCase();

          let optionBgStyle = "";
          let optionBorderStyle = "border-gray-300"; // Default border
          let optionIconContainerStyle = "border-gray-300";
          // let optionIconTextStyle = ""; // Not currently used for specific styling

          // Unified styling logic
          if (isThisOptionTheCorrectAnswer) {
            optionBgStyle = "bg-green-50";
            optionBorderStyle = "border-green-600";
            optionIconContainerStyle =
              "border-green-600 bg-green-600 text-white";
          }
          if (isThisOptionTheUserAnswer && !isThisOptionTheCorrectAnswer) {
            // User answered, and it's wrong - overrides correct answer styling for this specific option if it happens
            optionBgStyle = "bg-red-50";
            optionBorderStyle = "border-red-600";
            optionIconContainerStyle = "border-red-600 bg-red-600 text-white";
          }

          // Default hover for non-selected, non-correct options
          const hoverStyle =
            !isThisOptionTheUserAnswer && !isThisOptionTheCorrectAnswer
              ? "hover:bg-gray-50"
              : "";

          return (
            <div
              key={option}
              className={`p-3 border rounded-md ${optionBorderStyle} ${optionBgStyle} ${hoverStyle}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${optionIconContainerStyle}`}
                >
                  <span className="text-sm">{option.toUpperCase()}</span>
                </div>
                <span>{optionValue}</span>

                {isThisOptionTheCorrectAnswer &&
                  !isCorrect && // Show only if the overall question was answered incorrectly
                  userAnswer !== undefined && // And the user actually provided an answer
                  (reviewContext === "incorrect" ||
                    reviewContext === "all") && (
                    <AlertCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
              </div>
            </div>
          );
        })}

        {question.answer_explanation && (
          <div className="mt-4">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <Info className="h-4 w-4 mr-1" />
              {showExplanation ? "Hide Explanation" : "Show Explanation"}
            </button>

            {showExplanation && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                {question.answer_explanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
