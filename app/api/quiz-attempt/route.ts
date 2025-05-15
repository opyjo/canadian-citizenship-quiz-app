import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase client with the ANONYMOUS key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using anon key

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  // Check for anon key
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Initialize with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userAnswers,
      questionIds,
      isTimed,
      timeTaken, // Assuming this is time_taken_seconds
      isPractice,
      practiceType,
      category,
    } = body;

    // Validate required fields
    if (!userAnswers || !questionIds) {
      return NextResponse.json(
        { error: "Missing required quiz data: userAnswers or questionIds" },
        { status: 400 }
      );
    }

    // Use the 'supabase' client (initialized with anon key)
    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert([
        {
          user_answers: userAnswers,
          question_ids: questionIds,
          is_timed: isTimed || false,
          time_taken_seconds: timeTaken,
          is_practice: isPractice || false,
          practice_type: practiceType,
          category: category,
        },
      ])
      .select("id") // Return the id of the inserted row
      .single(); // Expect a single row to be inserted and returned

    if (error) {
      console.error(
        "Supabase error inserting quiz attempt (using anon key):",
        error
      );
      return NextResponse.json(
        { error: error.message || "Failed to save quiz attempt" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Failed to save quiz attempt and retrieve ID (using anon key)",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ attemptId: data.id }, { status: 200 });
  } catch (err: any) {
    console.error(
      "Error processing quiz attempt POST request (using anon key):",
      err
    );
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
