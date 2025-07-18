"use client";

import { Suspense } from "react";
import { PracticeQuizContent } from "@/components/quiz/PracticeQuizContent";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";

// Loading fallback component
function PracticeQuizLoading() {
  return <QuizLoadingIndicator message="Preparing quiz..." />;
}

export default function PracticeQuizPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center p-4">
      <Suspense fallback={<PracticeQuizLoading />}>
        <PracticeQuizContent />
      </Suspense>
    </div>
  );
}
