import { useMemo } from "react";
import { parseQuizParams } from "../app/utils/helpers";

export function usePracticeParams(searchParams: URLSearchParams) {
  return useMemo(() => {
    const params = parseQuizParams(searchParams);
    let practiceType: "incorrect" | "random" | "" = "";
    let shouldRedirect = false;
    if (params.incorrectOnly) {
      practiceType = "incorrect";
    } else if (params.mode === "random" && params.count > 0) {
      practiceType = "random";
    } else {
      shouldRedirect = true;
    }
    return { ...params, practiceType, shouldRedirect };
  }, [searchParams]);
}
