import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Timer from "@/components/timer";
import { Question } from "@/stores/quiz/types";

interface TimedQuizViewProps {
  readonly state: {
    readonly timeRemaining: number;
  };
  readonly quiz: {
    readonly currentQuestion: Question;
    readonly selectedAnswers: Record<number, string>;
    readonly currentQuestionIndex: number;
    readonly progress: number;
    readonly questions: readonly Question[];
  };
  readonly handlers: {
    readonly handleAnswerSelect: (option: string) => void;
    readonly handleNext: () => void;
    readonly handlePrevious: () => void;
    readonly handleEndQuiz: () => void;
    readonly finishQuiz: () => void;
  };
  readonly uiFlags: {
    readonly isSubmitting: boolean;
  };
}

export function TimedQuizView({
  state,
  quiz,
  handlers,
  uiFlags,
}: TimedQuizViewProps) {
  const { timeRemaining } = state;
  const {
    currentQuestion,
    selectedAnswers,
    currentQuestionIndex,
    progress,
    questions,
  } = quiz;
  const {
    handleAnswerSelect,
    handleNext,
    handlePrevious,
    handleEndQuiz,
    finishQuiz,
  } = handlers;
  const { isSubmitting } = uiFlags;

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (!currentQuestion) {
    // This can happen briefly while the quiz is being set up.
    // A more specific loading indicator could be used here if needed.
    return null;
  }

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
      {/* Header for both Desktop and Mobile */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">
          Question {currentQuestionIndex + 1} of {questions.length}
        </h2>

        {/* Timer, visible on both desktop and mobile */}
        <Timer timeRemaining={timeRemaining} onTimeUp={finishQuiz} />
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="w-full">
        {/* Card Header with Question Title and End Quiz for Mobile */}
        <CardHeader className="flex flex-row justify-between items-start">
          <CardTitle className="text-xl md:text-2xl lg:text-3xl flex-1">
            {currentQuestion.question_text}
          </CardTitle>
          {/* Show "End Quiz" button in header on screens smaller than md */}
          <Button
            variant="destructive"
            onClick={handleEndQuiz}
            className="md:hidden ml-4" // Hidden on medium screens and up
            disabled={isSubmitting}
            size="sm"
          >
            End Quiz
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {["a", "b", "c", "d"].map((option) => (
            <button
              key={option}
              type="button"
              className={`w-full p-4 border rounded-lg text-left transition-colors ${
                selectedAnswers[currentQuestion.id] === option
                  ? "border-red-600 bg-red-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleAnswerSelect(option)}
              aria-pressed={selectedAnswers[currentQuestion.id] === option}
              disabled={isSubmitting}
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
            </button>
          ))}
        </CardContent>

        {/* Card Footer with Desktop "End Quiz" and Navigation */}
        <CardFooter className="flex flex-col md:flex-row md:justify-between items-center gap-4">
          {/* Show "End Quiz" button in footer on md screens and up */}
          <Button
            variant="destructive"
            onClick={handleEndQuiz}
            className="hidden md:inline-flex mr-auto" // Hidden on small screens
            disabled={isSubmitting}
          >
            End Quiz
          </Button>

          {/* Navigation buttons */}
          <div className="flex w-full md:w-auto gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="flex-1 md:flex-none"
            >
              Previous
            </Button>
            <Button
              onClick={isLastQuestion ? finishQuiz : handleNext}
              disabled={!selectedAnswers[currentQuestion.id] || isSubmitting}
              className="flex-1 md:flex-none"
            >
              {isSubmitting
                ? "Submitting..."
                : isLastQuestion
                ? "Finish Quiz"
                : "Next Question"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
