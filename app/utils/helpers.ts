import { Question, ResultData } from "./types";
import { QuizAttempt } from "@/hooks/useQuizAttempts";

export function calculateQuizStats(attempts: readonly QuizAttempt[]) {
  if (!attempts || attempts.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
    };
  }

  const validAttempts = attempts.filter(
    (attempt) =>
      attempt.score !== null && attempt.total_questions_in_attempt !== null
  );

  const totalQuizzes = attempts.length;

  const averageScore =
    validAttempts.length > 0
      ? Math.round(
          (validAttempts.reduce(
            (sum, attempt) =>
              sum +
              (attempt.score! / attempt.total_questions_in_attempt!) * 100,
            0
          ) /
            validAttempts.length) *
            10
        ) / 10
      : 0;

  const bestScore =
    validAttempts.length > 0
      ? Math.round(
          Math.max(
            ...validAttempts.map(
              (attempt) =>
                (attempt.score! / attempt.total_questions_in_attempt!) * 100
            )
          ) * 10
        ) / 10
      : 0;

  return { totalQuizzes, averageScore, bestScore };
}

export function parseQuizParams(searchParams: URLSearchParams) {
  return {
    incorrectOnly: searchParams.get("incorrect") === "true",
    count: parseInt(searchParams.get("count") ?? "0", 10),
    mode: searchParams.get("mode"),
  };
}

export function calculateScore(
  questions: Question[],
  selectedAnswers: Record<number, string>
): number {
  return questions.filter(
    (q, index) =>
      selectedAnswers[index]?.trim().toLowerCase() ===
      q.correct_option?.trim().toLowerCase()
  ).length;
}

export function prepareApiPayload(
  questions: Question[],
  resultData: ResultData,
  practiceType: string
) {
  const questionIds = questions.map((q) => q.id);
  const userAnswersForApi: Record<string, string> = {};

  resultData.questions.forEach((q: any, index: number) => {
    if (q.selected_option !== undefined) {
      userAnswersForApi[String(index)] = q.selected_option;
    }
  });

  return {
    userAnswers: userAnswersForApi,
    questionIds,
    isTimed: false,
    timeTaken: resultData.timeTaken,
    isPractice: true,
    practiceType,
    category: null,
  };
}

export function prepareTimedQuizPayload(
  questions: Question[],
  resultData: ResultData
) {
  const questionIds = questions.map((q) => q.id);
  const userAnswersForApi: Record<string, string> = {};

  resultData.questions.forEach((q: any) => {
    if (q.selected_option !== undefined) {
      userAnswersForApi[String(q.index)] = q.selected_option;
    }
  });

  return {
    userAnswers: userAnswersForApi,
    questionIds,
    isTimed: true,
    timeTaken: resultData.timeTaken,
    isPractice: false,
    practiceType: null,
  };
}
