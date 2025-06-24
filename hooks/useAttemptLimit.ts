// src/hooks/useAttemptLimit.ts
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import supabaseClient from "@/lib/supabase-client";
import {
  checkAuthenticatedUserLimits,
  checkUnauthenticatedUserLimits,
} from "@/lib/quizlimits/helpers";
import type { QuizMode } from "@/lib/quizlimits/constants";
import type { AttemptCheckResult } from "@/lib/quizlimits/types";

export function useAttemptLimit(mode: QuizMode) {
  const { user, initialized } = useAuth();
  const supabase = supabaseClient;

  const [isChecking, setIsChecking] = useState(true);
  const [canAttempt, setCanAttempt] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // If we're not initialized, we can't do anything yet.
    if (!initialized) {
      return;
    }

    let ignore = false;
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
        result = { canAttempt: true }; // Default to allow on error
      }

      if (!ignore) {
        setCanAttempt(result.canAttempt);
        if (result.canAttempt) {
          setMessage("");
          setIsLoggedIn(!!user);
        } else {
          setMessage(result.message);
          setIsLoggedIn(result.isLoggedIn);
        }
        setIsChecking(false);
      }
    };

    doCheck();

    return () => {
      ignore = true;
    };
  }, [initialized, user, mode, supabase]);

  return { isChecking, canAttempt, message, isLoggedIn };
}
