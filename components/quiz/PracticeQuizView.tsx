import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizHeader } from "./QuizHeader";

// Define the shape of the objects we expect as props
interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  [key: string]: any; // Allow for other properties
}

interface QuizData {
  currentQuestion: Question;
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
  const { handleAnswerSelect, handlePrevious, handleNext } = handlers;

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
                <span>{currentQuestion[`option_${option}`]}</span>
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
  );
}
