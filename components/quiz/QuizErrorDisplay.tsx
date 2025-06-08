import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface QuizErrorDisplayProps {
  readonly message: string;
}

export function QuizErrorDisplay({ message }: QuizErrorDisplayProps) {
  const router = useRouter();

  const isCongratulations = message.startsWith("Congratulations");
  const title = isCongratulations ? "All Clear!" : "Error";
  const titleColor = isCongratulations ? "text-green-600" : "text-red-600";
  const buttonText = isCongratulations
    ? "Return Home"
    : "Return to Practice Options";

  const handleButtonClick = () => {
    if (isCongratulations) {
      router.push("/");
    } else {
      router.push("/practice");
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className={titleColor}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{message}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleButtonClick}>{buttonText}</Button>
      </CardFooter>
    </Card>
  );
}
