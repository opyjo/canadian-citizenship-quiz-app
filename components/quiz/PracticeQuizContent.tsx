"use client";

import { usePracticeQuiz } from "@/hooks/usePracticeQuiz";
import { PracticeQuizView } from "@/components/quiz/PracticeQuizView";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";
import { QuizErrorDisplay } from "@/components/quiz/QuizErrorDisplay";
import { UnauthenticatedResultsView } from "@/components/quiz/UnauthenticatedResultsView";
import ConfirmationModal from "@/components/confirmation-modal";

export function PracticeQuizContent() {
  const { state, quiz, handlers, unauthenticatedResults } = usePracticeQuiz();

  switch (state.uiState) {
    case "LOADING":
      return <QuizLoadingIndicator message={state.loadingMessage} />;

    case "SHOWING_MODAL":
      return <ConfirmationModal {...state.modalState} />;

    case "SHOWING_FEEDBACK":
      return <QuizErrorDisplay message={state.feedbackMessage!} />;
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
      return <PracticeQuizView quiz={quiz} handlers={handlers} />;

    default:
      return null;
  }
}
