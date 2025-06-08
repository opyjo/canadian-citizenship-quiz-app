import { Loader2 } from "lucide-react";

interface QuizLoadingIndicatorProps {
  message: string;
}

export function QuizLoadingIndicator({ message }: QuizLoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      <p className="text-lg">{message}</p>
    </div>
  );
}
