import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import supabaseClient from "@/lib/supabase-client";
import {
  checkAuthenticatedUserLimits,
  checkUnauthenticatedUserLimits,
} from "@/lib/quizlimits/helpers";
import type { QuizMode } from "@/lib/quizlimits/constants";
import { AttemptCheckResult } from "@/lib/quizlimits/types";

export function useAttemptLimit(mode: QuizMode) {
  const { user, initialized } = useAuth();
  const supabase = supabaseClient;

  const [isChecking, setIsChecking] = useState(true);
  const [canAttempt, setCanAttempt] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    setIsChecking(true);
    const doCheck = async () => {
      let result: AttemptCheckResult;
      try {
        if (user) {
          result = await checkAuthenticatedUserLimits(user, mode, supabase);
        } else {
          result = await checkUnauthenticatedUserLimits(mode);
        }
      } catch (err) {
        console.error("Limit‐check failed:", err);
        result = { canAttempt: true };
      }

      if (result.canAttempt) {
        setCanAttempt(true);
        setMessage("");
      } else {
        setCanAttempt(false);
        setMessage(result.message);
        setIsLoggedIn(result.isLoggedIn);
      }

      setIsChecking(false);
    };

    doCheck();
  }, [initialized, user, mode, supabase]);

  return { isChecking, canAttempt, message, isLoggedIn };
}
