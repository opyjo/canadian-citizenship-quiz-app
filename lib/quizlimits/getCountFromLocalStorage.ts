import { AttemptCounts, LOCAL_STORAGE_KEY, QuizMode } from "./constants";

// SECTION 2: Local Storage Functions
// These functions handle tracking attempts for users who aren't logged in
// We use browser localStorage to remember how many quizzes they've taken
// ============================================================================

export function getLocalAttemptCounts(): AttemptCounts {
  if (typeof window === "undefined") {
    return { practice: 0, standard: 0, timed: 0 };
  }

  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    return { practice: 0, standard: 0, timed: 0 };
  }

  try {
    const parsed = JSON.parse(stored);
    // Validate the parsed data has the right shape
    if (isValidAttemptCounts(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error("Error parsing local quiz attempts:", error);
  }

  return { practice: 0, standard: 0, timed: 0 };
}

/**
 * Type guard to check if an object has the correct AttemptCounts shape
 */
function isValidAttemptCounts(obj: any): obj is AttemptCounts {
  return (
    typeof obj?.practice === "number" &&
    typeof obj?.standard === "number" &&
    typeof obj?.timed === "number"
  );
}

/**
 * Gets the attempt count for a specific quiz mode
 */
export function incrementLocalAttemptCount(quizMode: QuizMode): void {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  const counts = stored ? JSON.parse(stored) : {};
  counts[quizMode] = (counts[quizMode] ?? 0) + 1;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(counts));
}

// Returns count for a specific quiz mode
export function getLocalAttemptCount(quizMode: QuizMode): number {
  const counts = getLocalAttemptCounts();
  return counts[quizMode] || 0;
}
