export interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

export type QuizMode =
  | "practice"
  | "timed"
  | "standard"
  | "incorrect"
  | "random";

export type QuizStatus =
  | "idle"
  | "loading"
  | "active"
  | "submitting"
  | "completed"
  | "error";

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswers: Record<number, string>;
  mode: QuizMode;
  status: QuizStatus;
  error: string | null;
  timer: {
    startTime: number | null;
    endTime: number | null;
    duration: number; // in seconds
  };
  attempt: {
    id: string | null;
    score: number | null;
    submittedAt: string | null;
  };
  settings: {
    questionsPerQuiz: number;
    timeLimit: number; // in seconds
  };
}

export interface QuizActions {
  // Quiz initialization
  initializeQuiz: (
    mode: QuizMode,
    settings?: Partial<QuizState["settings"]>
  ) => Promise<void>;
  resetQuiz: () => void;

  // Question navigation
  setCurrentQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;

  // Answer management
  selectAnswer: (questionId: number, answer: string) => void;
  clearAnswer: (questionId: number) => void;

  // Quiz submission
  submitQuiz: () => Promise<void>;

  // Timer management
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;

  // Settings
  updateSettings: (settings: Partial<QuizState["settings"]>) => void;

  // Error handling
  setError: (error: string | null) => void;
  setStatus: (status: QuizStatus) => void;
}

export type QuizStore = QuizState & QuizActions;
