"use client";

import { useTimedQuiz } from "@/hooks/useTimedQuiz";
import { TimedQuizView } from "@/components/quiz/TimedQuizView";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";
import { QuizErrorDisplay } from "@/components/quiz/QuizErrorDisplay";
import { UnauthenticatedResultsView } from "@/components/quiz/UnauthenticatedResultsView";
import ConfirmationModal from "@/components/confirmation-modal";

export function TimedQuizContent() {
  const {
    isEndQuizModalOpen,
    timeRemaining,
    isSubmitting,
    quizData,
    quizHandlers,
    unauthenticatedResults,
    isLoading,
    isQuizActive,
    showUnauthResults,
    hasError,
    loadingMessage,
    feedbackMessage,
    handleCloseResults,
    error,
  } = useTimedQuiz();

  if (isLoading) {
    return <QuizLoadingIndicator message={loadingMessage || "Loading..."} />;
  }

  if (isSubmitting) {
    return <QuizLoadingIndicator message="Submitting your results..." />;
  }

  if (hasError) {
    return <QuizErrorDisplay message={error || "An error occurred."} />;
  }

  if (showUnauthResults) {
    return (
      <UnauthenticatedResultsView
        score={unauthenticatedResults.score!}
        totalQuestions={unauthenticatedResults.totalQuestions!}
        quizType="timed"
        onClose={handleCloseResults}
      />
    );
  }

  if (feedbackMessage) {
    return <QuizErrorDisplay message={feedbackMessage} />;
  }

  if (!isQuizActive) {
    return <QuizLoadingIndicator message="Preparing your quiz..." />;
  }

  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];

  if (!currentQuestion) {
    return <QuizLoadingIndicator message="Loading question..." />;
  }

  if (isEndQuizModalOpen) {
    return (
      <ConfirmationModal
        isOpen={true}
        onClose={quizHandlers.handleCloseEndQuizModal}
        onConfirm={quizHandlers.handleConfirmEndQuiz}
        title="End Quiz?"
        message="Are you sure you want to end the quiz? Your current answers will be submitted, and you will be taken to the results page."
        confirmText="End Quiz"
        cancelText="Continue Quiz"
      />
    );
  }

  return (
    <TimedQuizView
      state={{ timeRemaining }}
      quiz={quizData}
      handlers={{
        handleAnswerSelect: quizHandlers.selectAnswer,
        handleNext: quizHandlers.nextQuestion,
        handlePrevious: quizHandlers.previousQuestion,
        handleEndQuiz: quizHandlers.handleEndQuiz,
        finishQuiz: quizHandlers.finishQuiz,
      }}
      uiFlags={{ isSubmitting }}
    />
  );
}
