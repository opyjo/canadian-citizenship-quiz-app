import { Question, ResultData } from "./types";

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
