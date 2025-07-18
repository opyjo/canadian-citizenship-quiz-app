"use client";

import { useStandardQuiz } from "@/hooks/useStandardQuiz";
import { StandardQuizView } from "@/components/quiz/StandardQuizView";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";
import { QuizErrorDisplay } from "@/components/quiz/QuizErrorDisplay";
import { UnauthenticatedResultsView } from "@/components/quiz/UnauthenticatedResultsView";
import ConfirmationModal from "@/components/confirmation-modal";
import { useRouter } from "next/navigation";

export function StandardQuizContent() {
  const router = useRouter();
  const {
    isLoading,
    isQuizActive,
    showUnauthResults,
    isAuthenticated,
    canAttempt,
    loadingMessage,
    feedbackMessage,
    limitMessage,
    quiz,
    unauthenticatedResults,
    handlers,
    handleCloseResults,
    handleTryAgain,
    isSubmitting,
    isEndQuizModalOpen,
  } = useStandardQuiz();

  if (isLoading) {
    return <QuizLoadingIndicator message={loadingMessage || "Loading..."} />;
  }

  if (!canAttempt) {
    return (
      <ConfirmationModal
        isOpen={true}
        title="Access Denied"
        message={limitMessage || "You cannot attempt this quiz at this time."}
        confirmText={isAuthenticated ? "Upgrade Plan" : "Sign Up"}
        cancelText="Go Home"
        onConfirm={() => router.push(isAuthenticated ? "/pricing" : "/signup")}
        onClose={() => router.push("/")}
      />
    );
  }

  if (showUnauthResults) {
    return (
      <UnauthenticatedResultsView
        score={unauthenticatedResults.score!}
        totalQuestions={unauthenticatedResults.totalQuestions!}
        quizType="standard"
        onClose={handleCloseResults}
        onTryAgain={handleTryAgain}
      />
    );
  }

  if (feedbackMessage) {
    return <QuizErrorDisplay message={feedbackMessage} />;
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

  if (isQuizActive) {
    return (
      <StandardQuizView
        quiz={quiz}
        handlers={{
          handleAnswerSelect: handlers.selectAnswer,
          handlePrevious: handlers.previousQuestion,
          handleNext: handlers.nextQuestion,
          handleEndQuiz: handlers.handleEndQuiz,
          finishQuiz: handlers.finishQuiz,
        }}
        uiFlags={{ isSubmitting }}
      />
    );
  }

  return <QuizLoadingIndicator message="Preparing your quiz..." />;
}
