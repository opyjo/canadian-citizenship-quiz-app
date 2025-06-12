import { AttemptCheckResult } from "./types";
import { getLocalAttemptCount } from "./localStorage";
import { FREE_TIER_LIMITS, PAID_ACCESS_LEVELS, QuizMode } from "./constants";
import { SupabaseClient, User } from "@supabase/supabase-js";

export async function checkAttemptLimits(
  user: User | null,
  quizMode: QuizMode,
  supabase: SupabaseClient
): Promise<AttemptCheckResult> {
  // Unauthenticated user
  if (!user) {
    const attempts = getLocalAttemptCount(quizMode);
    const limit = FREE_TIER_LIMITS[quizMode];

    if (attempts >= limit) {
      return {
        canAttempt: false,
        limitReached: {
          isLoggedIn: false,
          message: `You've used your ${limit} free ${quizMode} quiz${
            limit > 1 ? "zes" : ""
          }. Sign up for more!`,
        },
      };
    }

    return { canAttempt: true };
  }

  // Authenticated user
  try {
    // Check if paid user
    const { data: profile } = await supabase
      .from("profiles")
      .select("access_level")
      .eq("id", user.id)
      .single();

    if (
      profile?.access_level &&
      PAID_ACCESS_LEVELS.includes(profile.access_level)
    ) {
      return { canAttempt: true };
    }

    // Check free user limits
    const response = await fetch(`/api/quiz-access-check?mode=${quizMode}`);
    if (!response.ok) {
      // On API error, fail open (allow attempt)
      console.error("[quizLimits] API error, allowing attempt");
      return { canAttempt: true };
    }

    const data = await response.json();

    if (!data.canAttempt) {
      return {
        canAttempt: false,
        limitReached: {
          isLoggedIn: true,
          message: `You've used your ${data.limit} free ${quizMode} quiz${
            data.limit > 1 ? "zes" : ""
          }. Upgrade for unlimited access!`,
        },
      };
    }

    return { canAttempt: true };
  } catch (error) {
    // On any error, fail open (allow attempt)
    console.error("[quizLimits] Error checking limits:", error);
    return { canAttempt: true };
  }
}
