import { SupabaseClient, User } from "@supabase/supabase-js";
import { PAID_ACCESS_LEVELS, FREE_TIER_LIMITS, QuizMode } from "./constants";
import { getLocalAttemptCount } from "./getCountFromLocalStorage";
import {
  UserProfile,
  ApiAccessCheckResponse,
  AttemptCheckResult,
} from "./types";

/**
 * Fetches a user's profile from the database to check their access level
 */
export async function fetchUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("access_level")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[quizLimits] Error fetching profile:", error);
    throw new Error("Could not verify your access status. Please try again.");
  }

  return data;
}

/**
 * Checks if a user profile indicates they have paid access
 */
export function isPaidUser(profile: UserProfile | null): boolean {
  return !!(
    profile?.access_level && PAID_ACCESS_LEVELS.includes(profile.access_level)
  );
}

/**
 * Calls your API to check if a free user can take another quiz
 * The API tracks attempts in the database for logged-in users
 */

// #TODO: Convert to Hook
export async function fetchApiAccessCheck(
  quizMode: QuizMode
): Promise<ApiAccessCheckResponse> {
  const response = await fetch(`/api/quiz-access-check?mode=${quizMode}`);

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response);
    console.error(
      `[quizLimits] API error response (${response.status}):`,
      errorMessage
    );
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!isValidApiResponse(data)) {
    console.error("[quizLimits] Invalid API response structure:", data);
    throw new Error("Invalid response from quiz access API.");
  }

  return data;
}

/**
 * Extracts a readable error message from a failed API response
 */
// #TODO: Do we really need this?
export async function extractErrorMessage(response: Response): Promise<string> {
  let errorMessage = "Failed to check attempts via API";

  try {
    const errorData = await response.json();
    errorMessage = errorData.error ?? errorMessage;
  } catch (jsonError) {
    console.warn(
      "[quizLimits] Could not parse error response JSON:",
      jsonError
    );
    errorMessage = response.statusText || errorMessage;
    if (response.status === 401) {
      errorMessage = "Unauthorized. Please log in again.";
    }
  }

  return errorMessage;
}

/**
 * Type guard to validate API response shape
 */
function isValidApiResponse(data: any): data is ApiAccessCheckResponse {
  return (
    typeof data?.canAttempt === "boolean" &&
    typeof data?.currentAttempts === "number" &&
    typeof data?.limit === "number"
  );
}

export async function checkAuthenticatedUserLimits(
  user: User,
  quizMode: QuizMode,
  supabase: SupabaseClient
): Promise<AttemptCheckResult> {
  try {
    const profile = await fetchUserProfile(supabase, user.id);

    if (isPaidUser(profile)) {
      // Paid users just get true
      return { canAttempt: true };
    }
    const apiResult = await fetchApiAccessCheck(quizMode);
    if (apiResult.canAttempt) {
      // Free users with attempts left
      return { canAttempt: true };
    }
    // Only include extra info when they can't attempt
    return {
      canAttempt: false,
      message: `You've used your ${apiResult.limit} free ${quizMode} quiz${
        apiResult.limit > 1 ? "zes" : ""
      }. Upgrade for unlimited access!`,
      isLoggedIn: true,
    };
  } catch (error: any) {
    return {
      canAttempt: false,
      message:
        error.message ?? "An error occurred while checking your quiz access.",
      isLoggedIn: true,
    };
  }
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

export async function checkAttemptLimitsWithAuth(
  user: User | null,
  quizMode: QuizMode,
  supabase: SupabaseClient
): Promise<AttemptCheckResult> {
  if (user) {
    return checkAuthenticatedUserLimits(user, quizMode, supabase);
  } else {
    return checkUnauthenticatedUserLimits(quizMode);
  }
}
