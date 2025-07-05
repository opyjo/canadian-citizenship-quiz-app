// src/hooks/useAttemptLimit.ts
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores";
import { getLocalAttemptCount } from "@/lib/quizlimits/getCountFromLocalStorage";
import { checkAttemptLimits } from "@/lib/quizlimits/checkAttemptLimits";
import { FREE_TIER_LIMITS, QuizMode } from "@/lib/quizlimits/constants";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useAttemptLimit(mode: QuizMode = "practice") {
  const [canAttempt, setCanAttempt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (authLoading) return;

    const checkLimits = async () => {
      const result = await checkAttemptLimits(user, mode, supabase);
      setCanAttempt(result.canAttempt);
      if (!result.canAttempt) {
        setMessage(result.message);
        setIsLoggedIn(result.isLoggedIn);
      } else {
        setMessage(null);
        setIsLoggedIn(!!user);
      }
      setIsLoading(false);
    };

    checkLimits();
  }, [user, authLoading, mode]);

  return {
    canAttempt,
    isLoading,
    message,
    isLoggedIn,
    attemptsRemaining:
      FREE_TIER_LIMITS[mode] - (getLocalAttemptCount(mode) || 0),
  };
}
