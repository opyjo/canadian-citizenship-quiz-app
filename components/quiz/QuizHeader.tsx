import { Progress } from "@/components/ui/progress";

interface QuizHeaderProps {
  readonly questionNumber: number;
  readonly totalQuestions: number;
  readonly practiceType: string;
  readonly progress: number;
}

export function QuizHeader({
  questionNumber,
  totalQuestions,
  practiceType,
  progress,
}: QuizHeaderProps) {
  return (
    <div className="max-w-3xl w-full space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">
            Question {questionNumber} of {totalQuestions}
          </h2>
          <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
            {practiceType === "incorrect"
              ? "Incorrect Questions"
              : "Random Practice"}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
