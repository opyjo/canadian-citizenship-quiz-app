// src/hooks/useAttemptLimit.ts
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores";
import { QuizMode } from "@/lib/quizlimits/constants";
import { checkQuizAccess } from "@/app/actions/check-quiz-access";
import { checkUnauthenticatedUserLimits } from "@/lib/quizlimits/helpers";

export function useAttemptLimit(mode: QuizMode) {
  // Select state slices individually for performance and stability
  const user = useAuthStore((state) => state.user);
  const authIsLoading = useAuthStore((state) => state.isLoading);

  const [canAttempt, setCanAttempt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Use a stable primitive value for the dependency array
  const userId = user?.id;

  useEffect(() => {
    // Don't run the check until the auth state is resolved
    if (authIsLoading) {
      setIsLoading(true);
      return;
    }

    const performCheck = async () => {
      setIsLoading(true);
      const result = user
        ? await checkQuizAccess(mode)
        : await checkUnauthenticatedUserLimits(mode);

      if (result.canAttempt) {
        setCanAttempt(true);
        setMessage("");
      } else {
        setCanAttempt(false);
        setMessage(result.message);
      }
      setIsLoading(false);
    };

    performCheck();
  }, [userId, mode, authIsLoading]); // Use stable userId dependency

  return { canAttempt, isLoading, message };
}
