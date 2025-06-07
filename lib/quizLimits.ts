import type { SupabaseClient } from "@supabase/supabase-js";

// 1. Define Types and Constants
// #############################################################################

export type QuizMode = "practice" | "standard" | "timed";

interface AttemptCounts {
  practice: number;
  standard: number;
  timed: number;
}

export const FREE_TIER_LIMITS: Readonly<AttemptCounts> = {
  practice: 1, // Example: 5 free practice quizzes
  standard: 1, // Example: 2 free standard quizzes
  timed: 1, // Example: 1 free timed quiz
};

const LOCAL_STORAGE_KEY = "quizAttemptCounts";

// Define an array of what constitutes a paid access level
const PAID_ACCESS_LEVELS = ["premium", "lifetime", "subscribed_monthly"]; // Added "lifetime" and "subscribed_monthly"

// 2. localStorage Functions (for Unauthenticated Users)
// #############################################################################

function getLocalAttemptCounts(): AttemptCounts {
  if (typeof window === "undefined") {
    return { practice: 0, standard: 0, timed: 0 };
  }
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Basic validation to ensure it has the expected structure
      if (
        typeof parsed.practice === "number" &&
        typeof parsed.standard === "number" &&
        typeof parsed.timed === "number"
      ) {
        return parsed;
      }
    } catch (error) {
      console.error("Error parsing local quiz attempts:", error);
      // Fallthrough to return default if parsing fails
    }
  }
  return { practice: 0, standard: 0, timed: 0 };
}

export function getLocalAttemptCount(quizMode: QuizMode): number {
  const counts = getLocalAttemptCounts();
  return counts[quizMode] || 0;
}

export function incrementLocalAttemptCount(quizMode: QuizMode): void {
  if (typeof window === "undefined") {
    return;
  }
  const counts = getLocalAttemptCounts();
  counts[quizMode] = (counts[quizMode] || 0) + 1;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(counts));
}

// 3. Main Access Check Function
// #############################################################################

export interface AttemptCheckResult {
  canAttempt: boolean;
  message: string;
  isPaidUser: boolean;
  isLoggedIn: boolean;
  reason?:
    | "limit_reached"
    | "auth_required"
    | "paid_access"
    | "free_access"
    | "api_error";
}

export async function checkAttemptLimits(
  quizMode: QuizMode,
  supabase: SupabaseClient
): Promise<AttemptCheckResult> {
  console.log(`[DEBUG] checkAttemptLimits called for mode: ${quizMode}`);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[DEBUG] User authentication status:", {
    userExists: !!user,
    userId: user?.id,
  });

  if (user) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("access_level")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("[quizLimits] Error fetching profile:", profileError);
        return {
          canAttempt: false, // Fail safe
          message: "Could not verify your access status. Please try again.",
          isPaidUser: false,
          isLoggedIn: true,
          reason: "api_error",
        };
      }

      // Modify this check to see if access_level is one of the paid types
      if (
        profile &&
        profile.access_level &&
        PAID_ACCESS_LEVELS.includes(profile.access_level)
      ) {
        // console.log("[checkAttemptLimits] Paid user, access_level:", profile.access_level); // Keep commented
        return {
          canAttempt: true,
          message: "Paid user, unlimited access.",
          isPaidUser: true,
          isLoggedIn: true,
          reason: "paid_access",
        };
      }

      // Authenticated free user: Check Supabase 'quiz_attempts' table
      // This will be done via an API route to protect direct DB queries from client
      // and to encapsulate the counting logic.
      try {
        const response = await fetch(`/api/quiz-access-check?mode=${quizMode}`);

        if (!response.ok) {
          let errorMessage = "Failed to check attempts via API";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            // If parsing JSON fails, use the status text or a generic message
            errorMessage = response.statusText || errorMessage;
            if (response.status === 401)
              errorMessage = "Unauthorized. Please log in again.";
          }
          console.error(
            `[quizLimits] API error response (${response.status}):`,
            errorMessage
          );
          throw new Error(errorMessage);
        }

        const apiResult = await response.json();
        // Expected: { currentAttempts: number, limit: number, canAttempt: boolean }
        // The API now directly returns canAttempt, currentAttempts, and limit derived from FREE_TIER_LIMITS on server.

        if (
          typeof apiResult.canAttempt === "boolean" &&
          typeof apiResult.currentAttempts === "number"
        ) {
          if (apiResult.canAttempt) {
            return {
              canAttempt: true,
              message: `Authenticated free user. Attempts remaining: ${
                apiResult.limit - apiResult.currentAttempts
              }`,
              isPaidUser: false,
              isLoggedIn: true,
              reason: "free_access",
            };
          } else {
            return {
              canAttempt: false,
              message: `You have used all your free attempts for ${quizMode} quizzes. Please upgrade for unlimited access.`,
              isPaidUser: false,
              isLoggedIn: true,
              reason: "limit_reached",
            };
          }
        } else {
          console.error(
            "[quizLimits] Invalid API response structure:",
            apiResult
          );
          throw new Error("Invalid response from quiz access API.");
        }
      } catch (apiError: any) {
        console.error("[quizLimits] API Error checking attempts:", apiError);
        return {
          canAttempt: false,
          message:
            apiError.message ||
            "An error occurred while checking your quiz access.",
          isPaidUser: false,
          isLoggedIn: true,
          reason: "api_error",
        };
      }
    } catch (error) {
      // Catch errors from fetching profile or other unexpected issues
      console.error("[quizLimits] Error checking auth user limits:", error);
      return {
        canAttempt: false,
        message: "An unexpected error occurred. Please try again.",
        isPaidUser: false,
        isLoggedIn: true,
        reason: "api_error",
      };
    }
  } else {
    // User is not logged in (unauthenticated)
    // console.log("[checkAttemptLimits] Unauthenticated user path entered."); // Debug log removed
    const currentAttempts = getLocalAttemptCount(quizMode);
    const limit = FREE_TIER_LIMITS[quizMode];

    console.log("[DEBUG] Unauthenticated user attempt tracking:", {
      quizMode,
      currentAttempts,
      limit,
    });

    if (currentAttempts < limit) {
      // console.log("[checkAttemptLimits] Unauth: Access GRANTED."); // Debug log removed
      return {
        canAttempt: true,
        message: `Unauthenticated user. Attempts remaining: ${
          limit - currentAttempts
        }`,
        isPaidUser: false,
        isLoggedIn: false,
        reason: "free_access",
      };
    } else {
      // console.log(
      //   "[checkAttemptLimits] Unauth: Access DENIED - limit reached."
      // );
      return {
        canAttempt: false,
        message: `You have used all your free attempts for ${quizMode} quizzes. Please sign up or log in. If you have an account, logging in may grant you more attempts or premium access.`,
        isPaidUser: false,
        isLoggedIn: false,
        reason: "limit_reached",
      };
    }
  }
}

// Example of how it might be used (for testing, not part of the lib directly):
// async function testLimits(supabaseClient: SupabaseClient) {
//   console.log("Testing practice quiz for unauthenticated user:");
//   let result = await checkAttemptLimits("practice", supabaseClient);
//   console.log(result);
//   incrementLocalAttemptCount("practice");
//   result = await checkAttemptLimits("practice", supabaseClient);
//   console.log(result);

//   // To test authenticated, you'd need a logged-in Supabase client
//   console.log("\nTesting timed quiz for (potentially) authenticated user:");
//   result = await checkAttemptLimits("timed", supabaseClient);
//   console.log(result);
// }

// Make sure to replace 'YOUR_SUPABASE_CLIENT_INSTANCE' with your actual Supabase client
// if you uncomment and run testLimits.
// e.g. import supabase from './supabaseClient'; // your supabase client setup
// testLimits(supabase);
