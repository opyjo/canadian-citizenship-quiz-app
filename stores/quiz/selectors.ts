import { QuizState } from "./types";

// Basic selectors
export const selectQuestions = (state: QuizState) => state.questions;
export const selectCurrentQuestionIndex = (state: QuizState) =>
  state.currentQuestionIndex;
export const selectSelectedAnswers = (state: QuizState) =>
  state.selectedAnswers;
export const selectQuizMode = (state: QuizState) => state.mode;
export const selectQuizStatus = (state: QuizState) => state.status;
export const selectQuizError = (state: QuizState) => state.error;
export const selectTimer = (state: QuizState) => state.timer;
export const selectAttempt = (state: QuizState) => state.attempt;
export const selectSettings = (state: QuizState) => state.settings;

// Derived selectors
export const selectCurrentQuestion = (state: QuizState) =>
  state.questions[state.currentQuestionIndex];

export const selectQuizProgress = (state: QuizState) => ({
  total: state.questions.length,
  current: state.currentQuestionIndex + 1,
  answered: Object.keys(state.selectedAnswers).length,
});

export const selectIsQuizComplete = (state: QuizState) =>
  Object.keys(state.selectedAnswers).length === state.questions.length;

export const selectCurrentAnswer = (state: QuizState) => {
  const currentQuestion = selectCurrentQuestion(state);
  return currentQuestion ? state.selectedAnswers[currentQuestion.id] : null;
};

export const selectTimeRemaining = (state: QuizState) => {
  if (!state.timer.startTime || state.mode !== "timed") return null;

  const elapsed = (state.timer.endTime || Date.now()) - state.timer.startTime;
  const remaining = state.settings.timeLimit * 1000 - elapsed;

  return Math.max(0, remaining);
};

export const selectQuizResults = (state: QuizState) => {
  if (state.status !== "completed") return null;

  const correctAnswers = state.questions.reduce((count, question) => {
    const selectedAnswer = state.selectedAnswers[question.id];
    return selectedAnswer === question.correctAnswer ? count + 1 : count;
  }, 0);

  return {
    total: state.questions.length,
    correct: correctAnswers,
    incorrect: state.questions.length - correctAnswers,
    score: state.attempt.score,
    submittedAt: state.attempt.submittedAt,
  };
};
