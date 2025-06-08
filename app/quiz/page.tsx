"use client";

import { Suspense } from "react";
import { useStandardQuiz } from "@/lib/hooks/useStandardQuiz";
import { StandardQuizView } from "@/components/quiz/StandardQuizView";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";
import { QuizErrorDisplay } from "@/components/quiz/QuizErrorDisplay";
import { UnauthenticatedResultsView } from "@/components/quiz/UnauthenticatedResultsView";
import ConfirmationModal from "@/components/confirmation-modal";

function StandardQuizContent() {
  const { state, quiz, handlers, unauthenticatedResults } = useStandardQuiz();

  if (state.isConfirmEndQuizModalOpen) {
    return (
      <ConfirmationModal
        isOpen={true}
        onClose={handlers.handleCloseConfirmModal}
        onConfirm={handlers.handleConfirmEndQuiz}
        title="End Quiz?"
        message="Are you sure you want to end the quiz? Your current answers will be submitted, and you will be taken to the results page."
        confirmText="End Quiz"
        cancelText="Continue Quiz"
      />
    );
  }

  switch (state.uiState) {
    case "LOADING":
      return <QuizLoadingIndicator message={state.loadingMessage} />;
    case "SHOWING_MODAL":
      return <ConfirmationModal {...state.modalState} />;
    case "SHOWING_FEEDBACK":
      return <QuizErrorDisplay message={state.feedbackMessage!} />;
    case "UNAUTHENTICATED_RESULTS":
      return <UnauthenticatedResultsView {...unauthenticatedResults} />;
    case "SHOWING_QUIZ":
      return <StandardQuizView quiz={quiz} handlers={handlers} />;
    default:
      return null;
  }
}

function StandardQuizLoading() {
  return <QuizLoadingIndicator message="Preparing quiz..." />;
}

export default function QuizPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <Suspense fallback={<StandardQuizLoading />}>
        <StandardQuizContent />
      </Suspense>
    </div>
  );
}
