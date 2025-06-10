"use client";

import { Suspense } from "react";
import { useTimedQuiz } from "@/hooks/useTimedQuiz";
import { TimedQuizView } from "@/components/quiz/TimedQuizView";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";
import { QuizErrorDisplay } from "@/components/quiz/QuizErrorDisplay";
import { UnauthenticatedResultsView } from "@/components/quiz/UnauthenticatedResultsView";
import ConfirmationModal from "@/components/confirmation-modal";

function TimedQuizContent() {
  const { state, quiz, handlers, unauthenticatedResults } = useTimedQuiz();

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
      return (
        <UnauthenticatedResultsView
          {...unauthenticatedResults}
          quizType="standard"
        />
      );
    case "SHOWING_QUIZ":
      return <TimedQuizView state={state} quiz={quiz} handlers={handlers} />;
    default:
      return null;
  }
}

function TimedQuizLoading() {
  return <QuizLoadingIndicator message="Preparing timed quiz..." />;
}

export default function TimedQuizPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <Suspense fallback={<TimedQuizLoading />}>
        <TimedQuizContent />
      </Suspense>
    </div>
  );
}
