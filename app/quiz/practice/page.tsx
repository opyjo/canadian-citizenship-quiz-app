"use client";

import { Suspense } from "react";
import { usePracticeQuiz } from "@/lib/hooks/usePracticeQuiz";
import { PracticeQuizView } from "@/components/quiz/PracticeQuizView";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";
import { QuizErrorDisplay } from "@/components/quiz/QuizErrorDisplay";
import { UnauthenticatedResultsView } from "@/components/quiz/UnauthenticatedResultsView";
import ConfirmationModal from "@/components/confirmation-modal";

function PracticeQuizContent() {
  const { state, quiz, handlers, unauthenticatedResults } = usePracticeQuiz();

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
      return <PracticeQuizView quiz={quiz} handlers={handlers} />;

    default:
      return null;
  }
}

// Loading fallback component
function PracticeQuizLoading() {
  return <QuizLoadingIndicator message="Preparing quiz..." />;
}

// Main component with Suspense wrapper
export default function PracticeQuizPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center p-4">
      <Suspense fallback={<PracticeQuizLoading />}>
        <PracticeQuizContent />
      </Suspense>
    </div>
  );
}
