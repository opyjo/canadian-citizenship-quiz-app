"use client";

import { TimedQuizContent } from "@/components/quiz/TimedQuizContent";

export default function TimedQuizPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <TimedQuizContent />
    </div>
  );
}
