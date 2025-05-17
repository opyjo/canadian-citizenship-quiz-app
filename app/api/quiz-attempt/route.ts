import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";

export async function POST(request: Request) {
  console.log("API Route: POST function in route.ts has been ENTERED.");

  const body = await request.json();
  console.log(
    "API Route: Incoming request body:",
    JSON.stringify(body, null, 2)
  );

  const {
    userAnswers, // e.g., { "0": "a", "1": "c", ... }
    questionIds, // e.g., [101, 203, 305, ...]
    isTimed,
    timeTaken, // Assuming this is time_taken_seconds
    isPractice,
    practiceType,
    // category, // Category is no longer used at the attempt level
  } = body;

  if (!userAnswers || !questionIds) {
    return NextResponse.json(
      { error: "Missing required quiz data: userAnswers or questionIds" },
      { status: 400 }
    );
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });

  let userId = null;
  let userEmail = null; // For logging
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.warn("API Route: Error fetching user:", userError.message);
    }
    if (user) {
      userId = user.id;
      userEmail = user.email;
      console.log("API Route: User identified:", { userId, userEmail });
    } else {
      console.warn("API Route: No user found from session.");
    }
  } catch (e: any) {
    console.warn("API Route: Exception fetching user:", e.message);
  }

  // Determine quiz_type
  let determinedQuizType = "standard"; // Default
  if (isTimed) {
    determinedQuizType = "timed";
  } else if (isPractice) {
    if (practiceType) {
      determinedQuizType = `practice_${practiceType
        .toLowerCase()
        .replace(/\s+/g, "_")}`;
    } else {
      determinedQuizType = "practice_general"; // Fallback if practiceType is null/empty
    }
  }
  console.log("API Route: Determined quizType:", determinedQuizType);

  // Placeholder for score and total_questions_in_attempt -
  // This logic needs to be implemented based on userAnswers and question details
  // For now, we'll set them as null or a default if not easily calculable here.
  // Ideally, the client would send the score and total questions, or we fetch question details here to calculate.
  const calculatedScore = null; // TODO: Implement score calculation
  const totalQuestions = questionIds ? questionIds.length : 0; // Can be derived from questionIds array length

  console.log("API Route: Calculated score (TODO):", calculatedScore);
  console.log("API Route: Total questions:", totalQuestions);

  const attemptDataToInsert = {
    user_answers: userAnswers,
    question_ids: questionIds,
    is_timed: isTimed || false,
    time_taken_seconds: timeTaken,
    is_practice: isPractice || false,
    practice_type: practiceType, // Storing the original practice_type can be useful
    // category: undefined, // Explicitly not including category
    user_id: userId,
    quiz_type: determinedQuizType,
    score: calculatedScore,
    total_questions_in_attempt: totalQuestions,
  };
  console.log(
    "API Route: Data to insert:",
    JSON.stringify(attemptDataToInsert, null, 2)
  );

  try {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert([attemptDataToInsert])
      .select("id")
      .single();

    if (error) {
      console.error("API Route: Supabase error inserting quiz attempt:", error);
      return NextResponse.json(
        { error: error.message || "Failed to save quiz attempt" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Failed to save quiz attempt and retrieve ID" },
        { status: 500 }
      );
    }
    console.log("API Route: Successfully inserted attempt, ID:", data.id);
    return NextResponse.json({ attemptId: data.id }, { status: 200 });
  } catch (err: any) {
    console.error(
      "API Route: Error processing quiz attempt POST request:",
      err
    );
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
