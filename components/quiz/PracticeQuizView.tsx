"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizHeader } from "./QuizHeader";
import { Question } from "@/stores/quiz/types";

interface QuizData {
  currentQuestion?: Question;
  selectedAnswers: Record<number, string>;
  currentQuestionIndex: number;
  progress: number;
  practiceType: string;
  questions: Question[];
}

interface QuizHandlers {
  handleAnswerSelect: (option: string) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  finishQuiz: () => void;
}

interface PracticeQuizViewProps {
  quiz: QuizData;
  handlers: QuizHandlers;
}

export function PracticeQuizView({ quiz, handlers }: PracticeQuizViewProps) {
  const {
    currentQuestion,
    selectedAnswers,
    currentQuestionIndex,
    progress,
    practiceType,
    questions,
  } = quiz;
  const { handleAnswerSelect, handlePrevious, handleNext, finishQuiz } =
    handlers;

  if (!questions?.length || !currentQuestion) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  const isLast = currentQuestionIndex === questions.length - 1;
  const actionText = isLast ? "Finish Practice" : "Next Question";
  const actionHandler = isLast ? finishQuiz : handleNext;

  const getOptionValue = (option: string): string => {
    switch (option) {
      case "a":
        return currentQuestion.option_a;
      case "b":
        return currentQuestion.option_b;
      case "c":
        return currentQuestion.option_c;
      case "d":
        return currentQuestion.option_d;
      default:
        return "";
    }
  };

  return (
    <div className="max-w-3xl w-full space-y-6">
      <QuizHeader
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        practiceType={practiceType}
        progress={progress}
      />

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
                selectedAnswers[currentQuestion.id] === option
                  ? "border-red-600 bg-red-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleAnswerSelect(option)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    selectedAnswers[currentQuestion.id] === option
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-gray-300"
                  }`}
                >
                  <span className="text-sm">{option.toUpperCase()}</span>
                </div>
                <span>{getOptionValue(option)}</span>
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
            onClick={actionHandler}
            disabled={!selectedAnswers[currentQuestion.id]}
          >
            {actionText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
