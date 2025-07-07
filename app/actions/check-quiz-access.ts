"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isPaidUser } from "@/lib/quizlimits/helpers";
import { FREE_TIER_LIMITS, QuizMode } from "@/lib/quizlimits/constants";
import { AttemptCheckResult } from "@/lib/quizlimits/types";

/**
 * A Server Action to securely check a user's quiz attempt limits.
 * It directly queries the database on the server, avoiding any RLS or
 * client-side session issues.
 *
 * @param quizMode The type of quiz being attempted.
 * @returns An object indicating if the user can attempt the quiz.
 */
export async function checkQuizAccess(
  quizMode: QuizMode
): Promise<AttemptCheckResult> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      canAttempt: false,
      message: "You must be logged in to perform this action.",
      isLoggedIn: false,
    };
  }

  // Fetch the user's profile to check their access level
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("access_level")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile for access check:", profileError);
    return {
      canAttempt: false,
      message: "Could not verify your access status. Please try again.",
      isLoggedIn: true,
    };
  }

  // If the user has a paid access level, grant access immediately.
  if (isPaidUser(profile ?? {})) {
    return { canAttempt: true };
  }

  // For free users, check their attempt count from the database.
  const limit = FREE_TIER_LIMITS[quizMode];

  // Point to the correct summary table for free attempts
  const { data: attemptData, error: countError } = await supabase
    .from("user_freemium_quiz_counts")
    .select("count")
    .eq("user_id", user.id)
    .eq("mode", quizMode)
    .single();

  // PGRST116 means no row was found, which is not an error here.
  // It simply means the user has 0 attempts for this quiz mode.
  if (countError && countError.code !== "PGRST116") {
    console.error("Error counting quiz attempts:", countError);
    return {
      canAttempt: false,
      message: "Could not verify your quiz attempt count.",
      isLoggedIn: true,
    };
  }

  const currentAttempts = attemptData?.count ?? 0;

  if (currentAttempts < limit) {
    return { canAttempt: true };
  }

  // User has reached their limit.
  return {
    canAttempt: false,
    message: `You've used your ${limit} free ${quizMode} quizzes. Upgrade for unlimited access!`,
    isLoggedIn: true,
  };
}
