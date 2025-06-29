"use client";

import { Suspense } from "react";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";
import { PracticeQuizContent } from "@/components/quiz/PracticeQuizContent";

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
