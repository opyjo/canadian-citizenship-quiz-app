import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Question } from "@/stores/quiz/types";

interface StandardQuizViewProps {
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

export function StandardQuizView({
  quiz,
  handlers,
  uiFlags,
}: StandardQuizViewProps) {
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">
          Question {currentQuestionIndex + 1} of {questions.length}
        </h2>
        <Button
          variant="destructive"
          onClick={handleEndQuiz}
          className="md:hidden"
          disabled={isSubmitting}
          size="sm"
        >
          End Quiz
        </Button>
        <span className="hidden md:inline-flex text-sm text-muted-foreground">
          {selectedAnswers[currentQuestion.id] ? "Answered" : "Not answered"}
        </span>
      </div>
      <Progress value={progress} className="h-2" />

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
              onClick={() => !isSubmitting && handleAnswerSelect(option)}
              onKeyDown={(e) =>
                !isSubmitting && e.key === "Enter" && handleAnswerSelect(option)
              }
              role="button"
              tabIndex={isSubmitting ? -1 : 0}
              aria-pressed={selectedAnswers[currentQuestion.id] === option}
              aria-disabled={isSubmitting}
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
        <CardFooter className="flex flex-col md:flex-row md:justify-between items-center gap-4">
          <Button
            variant="destructive"
            onClick={handleEndQuiz}
            className="hidden md:inline-flex mr-auto" // Hidden on small screens
            disabled={isSubmitting}
          >
            End Quiz
          </Button>
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
