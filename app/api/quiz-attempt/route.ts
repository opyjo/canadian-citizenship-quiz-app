import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface QuestionFromDB {
  id: number;
  correct_option: string;
}

export async function POST(request: Request) {
  console.log(
    "API Route: POST function in quiz-attempt/route.ts has been ENTERED."
  );

  const body = await request.json();
  console.log(
    "API Route: Incoming request body:",
    JSON.stringify(body, null, 2)
  );

  const {
    userAnswers, // e.g., { "0": "a", "1": "c", ... } - keys are stringified indices
    questionIds, // e.g., [101, 203, 305, ...] - IDs in order of presentation
    isTimed,
    timeTaken,
    isPractice,
    practiceType,
  } = body;

  if (!userAnswers || !questionIds || questionIds.length === 0) {
    return NextResponse.json(
      { error: "Missing or invalid required quiz data" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();

  let userId = null;
  let userEmail = null;
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError)
      console.warn("API Route: Error fetching user:", userError.message);
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

  let determinedQuizType = "standard";
  if (isTimed) determinedQuizType = "timed";
  else if (isPractice) {
    determinedQuizType = practiceType
      ? `practice_${practiceType.toLowerCase().replace(/\s+/g, "_")}`
      : "practice_general";
  }
  console.log("API Route: Determined quizType:", determinedQuizType);

  let calculatedScore = 0;
  const totalQuestions = questionIds.length;

  try {
    // Fetch correct answers for the submitted questionIds
    const { data: correctQuestionsData, error: questionsError } = await supabase
      .from("questions")
      .select("id, correct_option")
      .in("id", questionIds);

    if (questionsError) {
      console.error(
        "API Route: Supabase error fetching question details:",
        questionsError
      );
      throw new Error("Failed to fetch question details for score calculation");
    }
    if (
      !correctQuestionsData ||
      correctQuestionsData.length !== questionIds.length
    ) {
      console.error(
        "API Route: Mismatch in fetched questions count or no data.",
        { expected: questionIds.length, got: correctQuestionsData?.length }
      );
      // Decide how to handle: error out, or score as 0 for missing ones?
      // For now, we'll proceed but score might be inaccurate if there's a mismatch.
      // A stricter approach would be to throw an error.
    }

    // Create a map for quick lookup: questionId -> correct_option
    const correctOptionsMap = new Map<number, string>();
    correctQuestionsData?.forEach((q: QuestionFromDB) => {
      correctOptionsMap.set(q.id, q.correct_option);
    });

    // Calculate score
    // userAnswers keys are stringified indices from 0 to N-1, mapping to questionIds order
    for (let i = 0; i < totalQuestions; i++) {
      const questionId = questionIds[i]; // Get the actual question ID
      const userAnswer = userAnswers[String(i)]; // User's answer for this question by original index
      const correctAnswer = correctOptionsMap.get(questionId);

      if (
        userAnswer &&
        correctAnswer &&
        userAnswer.toLowerCase() === correctAnswer.toLowerCase()
      ) {
        calculatedScore++;
      }
    }
    console.log(
      "API Route: Calculated score:",
      calculatedScore,
      "out of",
      totalQuestions
    );
  } catch (scoreCalcError: any) {
    console.error(
      "API Route: Error during score calculation:",
      scoreCalcError.message
    );
    // Decide if we should still insert the attempt with a null score or return an error
    // For now, we are inserting with a potentially 0 or partially calculated score if error occurs mid-calc
    // but if fetching questions fails, `calculatedScore` remains 0 as initialized.
  }

  const attemptDataToInsert = {
    user_answers: userAnswers,
    question_ids: questionIds,
    is_timed: isTimed || false,
    time_taken_seconds: timeTaken,
    is_practice: isPractice || false,
    practice_type: practiceType,
    user_id: userId,
    quiz_type: determinedQuizType,
    score: calculatedScore, // Use the calculated score
    total_questions_in_attempt: totalQuestions,
  };
  console.log(
    "API Route: Data to insert:",
    JSON.stringify(attemptDataToInsert, null, 2)
  );

  try {
    const { data: insertData, error: insertError } = await supabase
      .from("quiz_attempts")
      .insert([attemptDataToInsert])
      .select("id")
      .single();

    if (insertError) {
      console.error(
        "API Route: Supabase error inserting quiz attempt:",
        insertError
      );
      return NextResponse.json(
        { error: insertError.message || "Failed to save quiz attempt" },
        { status: 500 }
      );
    }
    if (!insertData) {
      return NextResponse.json(
        { error: "Failed to save quiz attempt and retrieve ID" },
        { status: 500 }
      );
    }
    console.log("API Route: Successfully inserted attempt, ID:", insertData.id);
    return NextResponse.json({ attemptId: insertData.id }, { status: 200 });
  } catch (err: any) {
    console.error(
      "API Route: Outer error processing quiz attempt POST request:",
      err
    );
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
