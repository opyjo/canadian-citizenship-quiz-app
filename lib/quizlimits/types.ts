// The shape of the result returned by checkAttemptLimits
export type AttemptCheckResult =
  | { canAttempt: true }
  | { canAttempt: false; message: string; isLoggedIn: boolean };

// Internal types for better type safety
export interface UserProfile {
  access_level?: string | null;
}

export interface ApiAccessCheckResponse {
  canAttempt: boolean;
  currentAttempts: number;
  limit: number;
}
