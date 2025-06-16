import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Question {
  readonly id: number;
  readonly question_text: string;
  readonly option_a: string;
  readonly option_b: string;
  readonly option_c: string;
  readonly option_d: string;
  readonly correct_option: string;
}

interface QuestionReviewProps {
  readonly question: Question;
  readonly userAnswer: string | undefined;
  readonly isCorrect: boolean;
  readonly questionNumber: number;
  readonly reviewContext: "all" | "correct" | "incorrect";
}

function getOptionStyles(
  isUserAnswer: boolean,
  isCorrectAnswer: boolean
): {
  bgStyle: string;
  borderStyle: string;
  iconContainerStyle: string;
  hoverStyle: string;
} {
  // Default styles
  const defaultStyles = {
    bgStyle: "",
    borderStyle: "border-gray-300",
    iconContainerStyle: "border-gray-300",
    hoverStyle: "hover:bg-gray-50",
  };

  // Correct answer styles
  if (isCorrectAnswer) {
    return {
      bgStyle: "bg-green-50",
      borderStyle: "border-green-600",
      iconContainerStyle: "border-green-600 bg-green-600 text-white",
      hoverStyle: "",
    };
  }

  // Wrong user answer styles
  if (isUserAnswer) {
    return {
      bgStyle: "bg-red-50",
      borderStyle: "border-red-600",
      iconContainerStyle: "border-red-600 bg-red-600 text-white",
      hoverStyle: "",
    };
  }

  return defaultStyles;
}

function shouldShowAlertIcon(
  isCorrectOption: boolean,
  isQuestionCorrect: boolean,
  hasUserAnswer: boolean,
  reviewContext: string
): boolean {
  return (
    isCorrectOption &&
    !isQuestionCorrect &&
    hasUserAnswer &&
    (reviewContext === "incorrect" || reviewContext === "all")
  );
}

export function QuestionReview({
  question,
  userAnswer,
  isCorrect,
  questionNumber,
  reviewContext,
}: QuestionReviewProps) {
  const questionStatusClass = isCorrect
    ? "bg-green-100 text-green-600"
    : "bg-red-100 text-red-600";

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-2">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${questionStatusClass}`}
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
          </div>
          <p>{question.question_text}</p>
        </div>
      </div>

      <div className="space-y-2 pl-8">
        {(["a", "b", "c", "d"] as const).map((option) => {
          const optionValue = question[
            `option_${option}` as keyof Question
          ] as string;
          const isUserAnswer =
            userAnswer?.toUpperCase() === option.toUpperCase();
          const isCorrectAnswer =
            question.correct_option === option.toUpperCase();

          const styles = getOptionStyles(
            isUserAnswer && !isCorrectAnswer,
            isCorrectAnswer
          );

          const showAlert = shouldShowAlertIcon(
            isCorrectAnswer,
            isCorrect,
            userAnswer !== undefined,
            reviewContext
          );

          return (
            <div
              key={option}
              className={`p-3 border rounded-md ${styles.borderStyle} ${styles.bgStyle} ${styles.hoverStyle}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${styles.iconContainerStyle}`}
                >
                  <span className="text-sm">{option.toUpperCase()}</span>
                </div>
                <span>{optionValue}</span>
                {showAlert && (
                  <AlertCircle className="h-5 w-5 text-green-600 ml-auto" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
