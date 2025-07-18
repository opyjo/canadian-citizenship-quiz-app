"use client";

import { Suspense } from "react";
import { QuizLoadingIndicator } from "@/components/quiz/QuizLoadingIndicator";
import { StandardQuizContent } from "@/components/quiz/StandardQuizContent";

function StandardQuizLoading() {
  return <QuizLoadingIndicator message="Preparing quiz..." />;
}

export default function StandardQuizPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <Suspense fallback={<StandardQuizLoading />}>
        <StandardQuizContent />
      </Suspense>
    </div>
  );
}
