import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FREE_TIER_LIMITS, type QuizMode } from "@/lib/quizLimits";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = cookies();
  // Ensure createServerClient is correctly implemented and doesn't cause issues here.
  // We are proceeding under the assumption that lib/supabase/server.ts is functional.
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("[api/quiz-access-check] Auth error:", authError);
    return NextResponse.json(
      { error: "Unauthorized: User not authenticated." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const quizModeParam = searchParams.get("mode");

  if (
    !quizModeParam ||
    !Object.keys(FREE_TIER_LIMITS).includes(quizModeParam)
  ) {
    return NextResponse.json(
      {
        error: `Invalid or missing quiz mode. Must be one of: ${Object.keys(
          FREE_TIER_LIMITS
        ).join(", ")}`,
      },
      { status: 400 }
    );
  }
  const quizMode = quizModeParam as QuizMode;

  try {
    const { data: attemptData, error: attemptError } = await supabase
      .from("user_freemium_quiz_counts")
      .select("count")
      .eq("user_id", user.id)
      .eq("mode", quizMode)
      .single(); // Use single as there should be at most one row per user/mode.

    // PGRST116 means "The result contains 0 rows" which is not an error for us, it means 0 attempts.
    if (attemptError && attemptError.code !== "PGRST116") {
      console.error(
        `[api/quiz-access-check] Error fetching quiz attempts for user ${user.id}, mode ${quizMode}:`,
        attemptError
      );
      return NextResponse.json(
        { error: "Database error: Failed to fetch quiz attempts." },
        { status: 500 }
      );
    }

    const currentAttempts = attemptData ? attemptData.count : 0;
    const limit = FREE_TIER_LIMITS[quizMode];
    const canAttempt = currentAttempts < limit;

    return NextResponse.json({
      currentAttempts,
      limit,
      canAttempt,
      // userId: user.id, // Optional: for debugging on client
      // quizMode,      // Optional: for debugging on client
    });
  } catch (error: any) {
    console.error(
      `[api/quiz-access-check] Unexpected error for user ${user.id}, mode ${quizMode}:`,
      error
    );
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
