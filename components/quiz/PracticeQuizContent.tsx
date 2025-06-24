"use client";

import { usePracticeQuiz } from "@/hooks/usePracticeQuiz";
import { PracticeQuizView } from "@/components/quiz/PracticeQuizView";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";
import { QuizErrorDisplay } from "@/components/quiz/QuizErrorDisplay";
import { UnauthenticatedResultsView } from "@/components/quiz/UnauthenticatedResultsView";
import ConfirmationModal from "@/components/confirmation-modal";

export function PracticeQuizContent() {
  const {
    uiState,
    loadingMessage,
    feedbackMessage,
    modalState,
    quizData,
    quizHandlers,
    unauthenticatedResults,
  } = usePracticeQuiz();

  switch (uiState) {
    case "LOADING":
      return <QuizLoadingIndicator message={loadingMessage} />;

    case "SHOWING_MODAL":
      return <ConfirmationModal {...modalState} />;

    case "SHOWING_FEEDBACK":
      return <QuizErrorDisplay message={feedbackMessage!} />;
    case "SUBMITTING":
      return <QuizLoadingIndicator message="Submitting your results..." />;

    case "UNAUTHENTICATED_RESULTS":
      return (
        <UnauthenticatedResultsView
          {...unauthenticatedResults}
          quizType="practice"
        />
      );

    case "SHOWING_QUIZ":
      if (!quizData.currentQuestion) {
        // This can happen for a brief moment before the first question is ready.
        // Or if there are no questions.
        return <QuizLoadingIndicator message="Loading questions..." />;
      }
      return <PracticeQuizView quiz={quizData} handlers={quizHandlers} />;

    default:
      return null;
  }
}
