"use client";

import { Suspense } from "react";
import { useStandardQuiz } from "@/hooks/useStandardQuiz";
import { StandardQuizView } from "@/components/quiz/StandardQuizView";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";
import { QuizErrorDisplay } from "@/components/quiz/QuizErrorDisplay";
import { UnauthenticatedResultsView } from "@/components/quiz/UnauthenticatedResultsView";
import ConfirmationModal from "@/components/confirmation-modal";

function StandardQuizContent() {
  const {
    isLoading,
    isSubmitting,
    isQuizActive,
    isEndQuizModalOpen,
    showUnauthResults,
    loadingMessage,
    feedbackMessage,
    quiz,
    handlers,
    unauthenticatedResults,
    handleCloseResults,
  } = useStandardQuiz();

  if (isLoading) {
    return <QuizLoadingIndicator message={loadingMessage || "Loading..."} />;
  }

  if (isEndQuizModalOpen) {
    return (
      <ConfirmationModal
        isOpen={true}
        onClose={handlers.handleCloseEndQuizModal}
        onConfirm={handlers.handleConfirmEndQuiz}
        title="End Quiz?"
        message="Are you sure you want to end the quiz? Your current answers will be submitted, and you will be taken to the results page."
        confirmText="End Quiz"
        cancelText="Continue Quiz"
      />
    );
  }

  if (showUnauthResults) {
    return (
      <UnauthenticatedResultsView
        {...unauthenticatedResults}
        onClose={handleCloseResults}
      />
    );
  }

  if (feedbackMessage) {
    return <QuizErrorDisplay message={feedbackMessage} />;
  }

  if (isQuizActive) {
    return (
      <StandardQuizView
        quiz={quiz}
        handlers={{
          handleAnswerSelect: handlers.selectAnswer,
          handleNext: handlers.nextQuestion,
          handlePrevious: handlers.previousQuestion,
          handleEndQuiz: handlers.handleEndQuiz,
          finishQuiz: handlers.finishQuiz,
        }}
        uiFlags={{
          isSubmitting,
        }}
      />
    );
  }

  return <QuizLoadingIndicator message="Preparing quiz..." />;
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
