import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface UnauthenticatedResultsViewProps {
  readonly score: number | null;
  readonly totalQuestions: number | null;
  readonly quizType?: "standard" | "practice" | "timed";
  readonly onClose?: () => void;
  readonly onTryAgain?: () => void;
}

export function UnauthenticatedResultsView({
  score,
  totalQuestions,
  quizType = "standard",
  onClose,
  onTryAgain,
}: UnauthenticatedResultsViewProps) {
  const router = useRouter();

  const isPractice = quizType === "practice";
  const title = isPractice ? "Practice Finished!" : "Quiz Finished!";
  const buttonText = isPractice ? "Try Another Practice" : "Try Another Quiz";
  const buttonAction = () => {
    if (isPractice) {
      router.push("/practice");
    } else {
      window.location.reload();
    }
  };

  const handlePrimaryAction = onTryAgain || onClose;

  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {score !== null && totalQuestions !== null ? (
          <p className="text-2xl">
            You scored: {score} / {totalQuestions}
          </p>
        ) : (
          <p>Your score is being calculated...</p>
        )}
        <p className="text-sm text-muted-foreground">
          As you are not logged in, your results are not saved.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        {handlePrimaryAction && (
          <Button onClick={handlePrimaryAction} className="w-full sm:w-auto">
            {buttonText}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="w-full sm:w-auto"
        >
          Return Home
        </Button>
      </CardFooter>
    </Card>
  );
}
