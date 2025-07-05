"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { QuizMode } from "@/lib/quizlimits/constants";

interface Payload {
  userAnswers: Record<string, string>;
  questionIds: number[];
  timeTaken?: number;
  practiceType?: string;
  quizMode: QuizMode;
}

interface QuestionFromDB {
  id: number;
  correct_option: string;
}

export async function submitQuizAttempt(payload: Payload) {
  // ============================================================================
  // 1) Destructure payload & validate required fields
  // ============================================================================
  const { userAnswers, questionIds, timeTaken, practiceType, quizMode } =
    payload;

  const isPractice = quizMode === "practice";
  const isTimed = quizMode === "timed";

  if (!userAnswers || !questionIds || questionIds.length === 0) {
    // Missing answers or question IDs → bail out early
    return { error: "Missing or invalid required quiz data" };
  }

  // ============================================================================
  // 2) Initialize Supabase server client & identify current user
  // ============================================================================
  const supabase = createSupabaseServerClient();
  let userId: string | null = null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    userId = user.id;
  }

  // ============================================================================
  // 3) Determine the string `quiz_type` to store in the DB
  // ============================================================================
  let determinedQuizType: string;
  switch (quizMode) {
    case "practice":
      determinedQuizType = practiceType
        ? `practice_${practiceType.toLowerCase().replace(/\s+/g, "_")}`
        : "practice_general";
      break;
    case "timed":
      determinedQuizType = "timed";
      break;
    case "standard":
    default:
      determinedQuizType = "standard";
      break;
  }

  // ============================================================================
  // 4) Calculate the user's score
  //    - Fetch correct options from the questions table
  //    - Tally up matches against `userAnswers`
  // ============================================================================
  let calculatedScore = 0;
  const totalQuestions = questionIds.length;
  const incorrectQuestionIds: number[] = [];
  const correctlyAnsweredIds: number[] = [];

  try {
    const { data: correctQuestionsData, error: questionsError } = await supabase
      .from("questions")
      .select("id, correct_option")
      .in("id", questionIds);

    if (questionsError) {
      console.error(
        "Server Action: Supabase error fetching question details:",
        questionsError
      );
      return {
        error: "Failed to fetch question details for score calculation",
      };
    }

    // Build a lookup map: questionId → correct_option
    const correctOptionsMap = new Map<number, string>();
    correctQuestionsData?.forEach((q: QuestionFromDB) => {
      correctOptionsMap.set(q.id, q.correct_option);
    });

    // Compare each user answer against the correct answer
    for (let i = 0; i < totalQuestions; i++) {
      const qid = questionIds[i];
      const userAns = userAnswers[String(i)];
      const correctAns = correctOptionsMap.get(qid);

      if (
        userAns &&
        correctAns &&
        userAns.toLowerCase() === correctAns.toLowerCase()
      ) {
        calculatedScore++;
        // If the answer is correct, add the question ID to our list
        correctlyAnsweredIds.push(qid);
      } else {
        // If the answer is incorrect, add the question ID to our list
        incorrectQuestionIds.push(qid);
      }
    }
  } catch (scoreCalcError: any) {
    console.error(
      "Server Action: Error during score calculation:",
      scoreCalcError.message
    );
    return {
      error: "An unexpected error occurred during score calculation.",
    };
  }

  // ============================================================================
  // 5) Create a correctly keyed answer map for reliable storage
  // ============================================================================
  const answersById = questionIds.reduce((acc, qid, index) => {
    if (userAnswers[index]) {
      acc[qid] = userAnswers[index];
    }
    return acc;
  }, {} as Record<string, string>);

  // ============================================================================
  // 6) If authenticated, insert the attempt and increment freemium counters
  // ============================================================================
  if (userId) {
    const attemptData = {
      user_answers: answersById,
      question_ids: questionIds,
      is_timed: isTimed,
      time_taken_seconds: timeTaken,
      is_practice: isPractice,
      practice_type: practiceType,
      user_id: userId,
      quiz_type: determinedQuizType,
      score: calculatedScore,
      total_questions_in_attempt: totalQuestions,
    };

    try {
      const { data: insertData, error: insertError } = await supabase
        .from("quiz_attempts")
        .insert([attemptData])
        .select("id")
        .single();

      if (insertError || !insertData?.id) {
        console.error(
          "Server Action: Failed to save quiz attempt:",
          insertError ?? "no insertData.id"
        );
        return {
          error:
            insertError?.message ||
            "Failed to save quiz attempt and retrieve ID",
          score: calculatedScore,
          attemptId: null,
        };
      }

      // After saving the main attempt, save the incorrectly answered questions
      if (incorrectQuestionIds.length > 0) {
        const incorrectRecords = incorrectQuestionIds.map((qid) => ({
          user_id: userId,
          question_id: qid,
        }));

        const { error: incorrectInsertError } = await supabase
          .from("user_incorrect_questions")
          .upsert(incorrectRecords, { onConflict: "user_id,question_id" });

        if (incorrectInsertError) {
          // Log this error but don't block the user's quiz result
          console.error(
            "Server Action: Failed to save incorrect questions:",
            incorrectInsertError
          );
        }
      }

      // If this was a practice of incorrect questions, remove the ones they got right
      if (practiceType === "incorrect" && correctlyAnsweredIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("user_incorrect_questions")
          .delete()
          .eq("user_id", userId)
          .in("question_id", correctlyAnsweredIds);

        if (deleteError) {
          // Log this error but don't block the user
          console.error(
            "Server Action: Failed to delete newly correct questions:",
            deleteError
          );
        }
      }

      // Optionally increment the user's freemium attempt count via RPC
      const { error: rpcError } = await supabase.rpc(
        "increment_user_quiz_mode_attempts",
        {
          p_user_id: userId,
          p_quiz_mode: quizMode,
        }
      );

      if (rpcError) {
        console.error(
          `Server Action: RPC error incrementing attempts for mode ${quizMode}:`,
          rpcError
        );
      }

      // ==========================================================================
      // 7) Invalidate Next.js cache for result pages
      // ==========================================================================
      revalidatePath("/results");
      revalidatePath(`/results/${insertData.id}`);

      // Return the newly created attempt ID + score
      return {
        attemptId: insertData.id,
        score: calculatedScore,
        error: null,
      };
    } catch (e: any) {
      console.error(
        "Server Action: Unexpected error inserting authenticated attempt:",
        e.message
      );
      return {
        error: "An unexpected error occurred while saving your attempt.",
        score: calculatedScore,
        attemptId: null,
      };
    }
  }

  // ============================================================================
  // 7) Guest user: do not persist, just return score and metadata
  // ============================================================================
  return {
    message: "Quiz processed; not stored for unauthenticated user.",
    score: calculatedScore,
    attemptId: null,
    error: null,
    quizType: determinedQuizType,
    totalQuestions,
    quizMode,
  };
}
