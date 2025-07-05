"use client";

import { usePracticeQuiz } from "@/hooks/usePracticeQuiz";
import { PracticeQuizView } from "@/components/quiz/PracticeQuizView";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";
import { QuizErrorDisplay } from "@/components/quiz/QuizErrorDisplay";
import { UnauthenticatedResultsView } from "@/components/quiz/UnauthenticatedResultsView";
import ConfirmationModal from "@/components/confirmation-modal";
import { useRouter } from "next/navigation";

export function PracticeQuizContent() {
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
    quizData,
    unauthenticatedResults,
    quizHandlers,
    handleCloseResults,
  } = usePracticeQuiz();

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
        quizType="practice"
        onClose={handleCloseResults}
      />
    );
  }

  if (feedbackMessage) {
    return <QuizErrorDisplay message={feedbackMessage} />;
  }

  if (isQuizActive) {
    return (
      <PracticeQuizView
        quiz={quizData}
        handlers={{
          handleAnswerSelect: quizHandlers.selectAnswer,
          handlePrevious: quizHandlers.previousQuestion,
          handleNext: quizHandlers.nextQuestion,
          finishQuiz: quizHandlers.finishQuiz,
        }}
      />
    );
  }

  // Fallback for initial render before quiz initializes
  return <QuizLoadingIndicator message="Preparing your quiz..." />;
}
