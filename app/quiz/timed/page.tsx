"use client";

import { Suspense } from "react";
import { useTimedQuiz } from "@/hooks/useTimedQuiz";
import { TimedQuizView } from "@/components/quiz/TimedQuizView";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";
import { QuizErrorDisplay } from "@/components/quiz/QuizErrorDisplay";
import { UnauthenticatedResultsView } from "@/components/quiz/UnauthenticatedResultsView";
import ConfirmationModal from "@/components/confirmation-modal";
import { useRouter } from "next/navigation";

function TimedQuizContent() {
  const {
    state,
    quiz: quizData,
    handlers: quizHandlers,
    uiFlags,
    unauthenticatedResults,
    isLoading,
    error,
    canAttempt,
    limitMessage,
    isSubmitting,
    isAuthenticated,
  } = useTimedQuiz();
  const router = useRouter();

  if (isLoading) {
    return <QuizLoadingIndicator message="Loading quiz..." />;
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

  if (error) {
    return <QuizErrorDisplay message={error} />;
  }

  if (isSubmitting) {
    return <QuizLoadingIndicator message="Submitting your results..." />;
  }

  if (!quizData.questions || quizData.questions.length === 0) {
    return <QuizLoadingIndicator message="Loading questions..." />;
  }

  if (unauthenticatedResults.score !== null) {
    return (
      <UnauthenticatedResultsView
        {...unauthenticatedResults}
        quizType="timed"
      />
    );
  }

  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
  if (!currentQuestion) {
    return <QuizLoadingIndicator message="Loading question..." />;
  }

  if (state.isEndQuizModalOpen) {
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
      state={state}
      quiz={{
        currentQuestion,
        selectedAnswers: quizData.selectedAnswers,
        currentQuestionIndex: quizData.currentQuestionIndex,
        progress:
          ((quizData.currentQuestionIndex + 1) / quizData.questions.length) *
          100,
        questions: quizData.questions,
      }}
      handlers={{
        handleAnswerSelect: quizHandlers.selectAnswer,
        handleNext: quizHandlers.nextQuestion,
        handlePrevious: quizHandlers.previousQuestion,
        handleEndQuiz: quizHandlers.handleEndQuiz,
        finishQuiz: quizHandlers.finishQuiz,
      }}
      uiFlags={uiFlags}
    />
  );
}

export default function TimedQuizPage() {
  return (
    <Suspense
      fallback={<QuizLoadingIndicator message="Preparing timed quiz..." />}
    >
      <TimedQuizContent />
    </Suspense>
  );
}
