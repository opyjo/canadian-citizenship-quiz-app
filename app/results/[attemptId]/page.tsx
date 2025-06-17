"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock } from "lucide-react";
import { useQuizResults } from "@/hooks/useQuizResults";
import { QuestionReview } from "@/components/quiz/QuestionReview";

export default function ResultsPage() {
  const router = useRouter();
  const { attemptId } = useParams();

  const {
    questions,
    userAnswers,
    loading,
    error,
    isTimed,
    isPractice,
    practiceType,
    quizCategory,
    correctAnswersCount,
    totalQuestions,
    scorePercentage,
    passed,
    formattedTimeTaken,
  } = useQuizResults(attemptId as string);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p>Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="w-full flex justify-between gap-4 mb-4">
          <Button onClick={() => router.push("/")} variant="outline">
            Return to Home
          </Button>
          {isPractice && (
            <Link href="/practice">
              <Button>Back to Practice</Button>
            </Link>
          )}
        </div>
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Quiz Results</CardTitle>
              {isPractice && (
                <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                  {practiceType === "category"
                    ? quizCategory
                    : "Incorrect Questions"}{" "}
                  Practice
                </div>
              )}
              {isTimed && (
                <div className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Time: {formattedTimeTaken}
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
              {!isPractice ? (
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
                  const userAnswerKey = String(index);
                  const userAnswer = userAnswers[userAnswerKey];
                  const isCorrect =
                    userAnswer?.toUpperCase() === question.correct_option;
                  return (
                    <QuestionReview
                      key={question.id}
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
                {questions.map((question, index) => {
                  const userAnswerKey = String(index);
                  const isCorrect =
                    userAnswers[userAnswerKey]?.toUpperCase() ===
                    question.correct_option;
                  if (!isCorrect) return null;

                  return (
                    <QuestionReview
                      key={question.id}
                      question={question}
                      userAnswer={userAnswers[userAnswerKey]}
                      isCorrect={true}
                      questionNumber={index + 1}
                      reviewContext="correct"
                    />
                  );
                })}
              </TabsContent>

              <TabsContent value="incorrect" className="space-y-4 mt-4">
                {questions.map((question, index) => {
                  const userAnswerKey = String(index);
                  const userAnswer = userAnswers[userAnswerKey];
                  const isCorrect =
                    userAnswer?.toUpperCase() === question.correct_option;

                  if (userAnswer === undefined || isCorrect) return null;

                  return (
                    <QuestionReview
                      key={question.id}
                      question={question}
                      userAnswer={userAnswer}
                      isCorrect={false}
                      questionNumber={index + 1}
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
