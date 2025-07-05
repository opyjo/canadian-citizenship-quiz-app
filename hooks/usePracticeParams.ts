import { useMemo } from "react";
import { parseQuizParams } from "../app/utils/helpers";
import { QuizMode } from "@/stores/quiz/types";

export function usePracticeParams(searchParams: URLSearchParams) {
  return useMemo(() => {
    const params = parseQuizParams(searchParams);
    let practiceType: QuizMode = "random";
    let shouldRedirect = false;

    if (params.incorrectOnly) {
      practiceType = "incorrect";
    } else if (params.mode === "random" && params.count > 0) {
      practiceType = "random";
    } else {
      shouldRedirect = true;
    }

    return {
      ...params,
      practiceType,
      shouldRedirect,
      count: params.count || 10, // Default to 10 questions if not specified
    };
  }, [searchParams]);
}
