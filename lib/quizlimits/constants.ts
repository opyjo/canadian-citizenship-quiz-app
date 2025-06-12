// ============================================================================
// SECTION 1: Type Definitions and Constants
// This section defines all the types and constants used throughout the module
// ============================================================================

export type QuizMode = "practice" | "standard" | "timed";

export interface AttemptCounts {
  practice: number;
  standard: number;
  timed: number;
}

// How many free attempts each user gets for each quiz type
export const FREE_TIER_LIMITS: Readonly<AttemptCounts> = {
  practice: 2,
  standard: 1,
  timed: 1,
};

// Where we store attempt counts for non-logged-in users
export const LOCAL_STORAGE_KEY = "quizAttemptCounts";

// Which access levels are considered "paid" (unlimited attempts)
export const PAID_ACCESS_LEVELS = ["lifetime", "subscribed_monthly"];
