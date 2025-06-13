export interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  [key: string]: any;
}

export type UIState =
  | "LOADING"
  | "SHOWING_MODAL"
  | "SHOWING_FEEDBACK"
  | "UNAUTHENTICATED_RESULTS"
  | "SHOWING_QUIZ"
  | "SUBMITTING";

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onClose?: () => void;
}

export interface ResultData {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  questions: any[];
  practiceType: string;
}

export interface UnauthenticatedResults {
  score: number | null;
  totalQuestions: number | null;
  quizType: "standard" | "practice" | "timed" | "incorrect" | "random";
}

export const TIME_LIMIT = 30 * 60; // 15 minutes in seconds
