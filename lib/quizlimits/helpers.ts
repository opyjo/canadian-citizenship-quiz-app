import { PAID_ACCESS_LEVELS, FREE_TIER_LIMITS, QuizMode } from "./constants";
import { getLocalAttemptCount } from "./getCountFromLocalStorage";
import { UserProfile, AttemptCheckResult } from "./types";

/**
 * Checks if a user profile indicates they have paid access
 */
export function isPaidUser(profile: UserProfile | null): boolean {
  return !!(
    profile?.access_level && PAID_ACCESS_LEVELS.includes(profile.access_level)
  );
}

export async function checkUnauthenticatedUserLimits(
  quizMode: QuizMode
): Promise<AttemptCheckResult> {
  const currentAttempts = getLocalAttemptCount(quizMode);
  const limit = FREE_TIER_LIMITS[quizMode];

  if (currentAttempts < limit) {
    return { canAttempt: true };
  }

  return {
    canAttempt: false,
    message: `You've used your ${limit} free ${quizMode} quiz${
      limit > 1 ? "zes" : ""
    }. Sign up for more!`,
    isLoggedIn: false,
  };
}
