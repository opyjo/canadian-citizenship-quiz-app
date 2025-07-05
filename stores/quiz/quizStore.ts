import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createClient } from "@supabase/supabase-js";
import { QuizStore, QuizState, QuizMode as StoreQuizMode } from "./types";
import { useAuthStore } from "../auth/authStore";
import { submitQuizAttempt } from "@/app/actions/submit-quiz-attempt";
import { QuizMode as ServerQuizMode } from "@/lib/quizlimits/constants";

// ============================================================================
// Supabase Client Initialization
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================================================
// Initial State Definition
// ============================================================================

const initialState: QuizState = {
  questions: [], // Array of quiz questions
  currentQuestionIndex: 0, // Index of the current question being displayed
  selectedAnswers: {}, // Object mapping question IDs to selected answers
  mode: "practice", // Current quiz mode (practice, timed, incorrect)
  status: "idle", // Current status of the quiz (idle, loading, active, etc.)
  error: null, // Error message if any
  timer: {
    startTime: null, // Timestamp when quiz started
    endTime: null, // Timestamp when quiz ended
    duration: 0, // Total duration in seconds
  },
  attempt: {
    id: null, // Database ID of the current attempt
    score: null, // Score for the current attempt (percentage)
    submittedAt: null, // Timestamp when quiz was submitted
  },
  settings: {
    questionsPerQuiz: 10, // Number of questions per quiz
    timeLimit: 900, // Time limit in seconds (15 minutes)
  },
};

// ============================================================================
// Quiz Store Creation
// ============================================================================

export const useQuizStore = create<QuizStore>()(
  devtools(
    (set, get) => ({
      // Include the initial state
      ...initialState,

      // ============================================================================
      // Quiz Initialization
      // ============================================================================

      initializeQuiz: async (mode: StoreQuizMode) => {
        try {
          // Set status to loading and update the mode
          set({ status: "loading", mode });
          const user = useAuthStore.getState().user;
          const questionsPerQuiz = get().settings.questionsPerQuiz;

          let questions;
          let error;

          // Use the appropriate RPC function based on quiz mode
          if (mode === "incorrect" && user) {
            // For incorrect questions mode, use get_incorrect_questions
            const result = await supabase.rpc("get_incorrect_questions", {
              user_id_param: user.id,
            });
            questions = result.data;
            error = result.error;
          } else if (mode === "practice") {
            // For practice mode, use get_random_practice_questions
            const result = await supabase.rpc("get_random_practice_questions", {
              user_id_param: user?.id || null,
              question_limit: questionsPerQuiz,
              incorrect_only: false,
            });
            questions = result.data;
            error = result.error;
          } else {
            // For standard/timed mode, use get_random_questions
            const result = await supabase.rpc("get_random_questions", {
              question_limit: questionsPerQuiz,
            });
            questions = result.data;
            error = result.error;
          }

          console.log("questions", questions);
          if (error) throw error;

          // Update the store with fetched questions and initialize quiz state
          set({
            questions: questions || [],
            status: questions?.length ? "active" : "error",
            error: questions?.length ? null : "No questions available",
            currentQuestionIndex: 0,
            selectedAnswers: {},
            timer: {
              ...initialState.timer,
              startTime: Date.now(), // Start the timer
            },
          });
        } catch (error) {
          // Handle any errors during initialization
          set({
            error: (error as Error).message,
            status: "error",
          });
        }
      },

      // ============================================================================
      // Navigation Functions
      // ============================================================================
      // Sets the current question to a specific index
      setCurrentQuestion: (index) => {
        if (index >= 0 && index < get().questions.length) {
          set({ currentQuestionIndex: index });
        }
      },

      // Moves to the next question if available
      nextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        if (currentQuestionIndex < questions.length - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
        }
      },

      // Moves to the previous question if available
      previousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 });
        }
      },

      // ============================================================================
      // Answer Management
      // ============================================================================
      // Records the user's selected answer for a question
      selectAnswer: (questionId: number, answer: string) =>
        set((state) => ({
          selectedAnswers: { ...state.selectedAnswers, [questionId]: answer },
        })),

      // ============================================================================
      // Quiz Submission
      // ============================================================================
      // Calculates score and saves quiz results
      submitQuiz: async () => {
        const state = get();

        try {
          set({ status: "submitting" });

          // Convert selectedAnswers from question ID keys to index keys for the server action
          const userAnswers: Record<string, string> = {};
          const questionIds = state.questions.map((q, index) => {
            if (state.selectedAnswers[q.id]) {
              userAnswers[String(index)] = state.selectedAnswers[q.id];
            }
            return q.id;
          });

          // Map store quiz mode to server quiz mode
          let serverQuizMode: ServerQuizMode;
          let practiceType: string | undefined;

          if (state.mode === "incorrect") {
            serverQuizMode = "practice";
            practiceType = "incorrect";
          } else if (state.mode === "practice" || state.mode === "random") {
            serverQuizMode = "practice";
            practiceType = "random";
          } else if (state.mode === "timed") {
            serverQuizMode = "timed";
            practiceType = undefined;
          } else {
            serverQuizMode = "standard";
            practiceType = undefined;
          }

          // Prepare payload for server action
          const payload = {
            userAnswers,
            questionIds,
            timeTaken: state.timer.duration,
            practiceType,
            quizMode: serverQuizMode,
          };

          // Call the server action
          const result = await submitQuizAttempt(payload);

          if (result.error) {
            throw new Error(result.error);
          }

          // For unauthenticated users, increment the attempt count in localStorage
          const user = useAuthStore.getState().user;
          if (!user && typeof window !== "undefined" && result.quizMode) {
            // This will only run in the browser
            const { incrementLocalAttemptCount } = await import(
              "@/lib/quizlimits/getCountFromLocalStorage"
            );
            incrementLocalAttemptCount(result.quizMode as ServerQuizMode);
          }

          // Update store with completed status and attempt details
          set({
            status: "completed",
            attempt: {
              id: result.attemptId ? String(result.attemptId) : null,
              score: result.score !== undefined ? result.score : null,
              submittedAt: new Date().toISOString(),
            },
          });
        } catch (error) {
          // Handle submission errors
          set({
            error: (error as Error).message,
            status: "error",
          });
        }
      },

      // ============================================================================
      // Timer Functions
      // ============================================================================
      // Starts the quiz timer
      startTimer: () =>
        set((state) => ({
          timer: { ...state.timer, startTime: Date.now() },
        })),

      // Stops the timer and calculates duration
      stopTimer: () =>
        set((state) => ({
          timer: {
            ...state.timer,
            endTime: Date.now(),
            duration: state.timer.startTime
              ? Math.floor((Date.now() - state.timer.startTime) / 1000)
              : 0,
          },
        })),

      // Resets the timer to initial state
      resetTimer: () =>
        set({
          timer: initialState.timer,
        }),

      // Resets the entire quiz state to initial values
      resetQuiz: () =>
        set(() => ({
          ...initialState,
        })),

      // ============================================================================
      // Settings and State Management
      // ============================================================================
      // Updates quiz settings
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      // Sets error state
      setError: (error) => set({ error }),

      // Sets quiz status
      setStatus: (status) => set({ status }),
    }),
    { name: "quiz-store" } // Name for Redux DevTools
  )
);
