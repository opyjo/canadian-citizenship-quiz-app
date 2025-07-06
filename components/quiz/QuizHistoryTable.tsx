"use client";

import { QuizAttempt } from "@/hooks/useQuizAttempts";
import { Fragment } from "react";

interface QuizHistoryTableProps {
  readonly attempts: readonly QuizAttempt[];
  readonly groupByType?: boolean;
}

const renderAttemptRow = (attempt: QuizAttempt) => {
  const getDisplayType = () => {
    if (attempt.is_practice && attempt.practice_type) {
      const formattedPracticeType =
        attempt.practice_type.charAt(0).toUpperCase() +
        attempt.practice_type.slice(1);
      return `Practice (${formattedPracticeType})`;
    }
    if (attempt.quiz_type) {
      return (
        attempt.quiz_type.charAt(0).toUpperCase() + attempt.quiz_type.slice(1)
      );
    }
    return "Unknown";
  };

  return (
    <div
      key={attempt.id}
      className="grid grid-cols-4 gap-4 p-4 text-xs sm:text-sm"
    >
      <div>
        {attempt.created_at
          ? new Date(attempt.created_at).toLocaleDateString()
          : "N/A"}
      </div>
      <div>{getDisplayType()}</div>
      <div>
        {attempt.score !== null && attempt.total_questions_in_attempt !== null
          ? `${attempt.score}/${
              attempt.total_questions_in_attempt
            } (${Math.round(
              (attempt.score / attempt.total_questions_in_attempt) * 100
            )}%)`
          : "N/A"}
      </div>
      <div>
        {attempt.time_taken_seconds
          ? `${Math.floor(attempt.time_taken_seconds / 60)}m ${
              attempt.time_taken_seconds % 60
            }s`
          : "N/A"}
      </div>
    </div>
  );
};

export function QuizHistoryTable({
  attempts,
  groupByType = false,
}: QuizHistoryTableProps) {
  if (attempts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No quiz attempts found.</p>
      </div>
    );
  }

  const groupedAttempts = groupByType
    ? attempts.reduce((acc, attempt) => {
        let type = "Unknown";
        if (attempt.is_practice) {
          type = "practice";
        } else if (attempt.quiz_type) {
          type = attempt.quiz_type;
        }

        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(attempt);
        return acc;
      }, {} as Record<string, QuizAttempt[]>)
    : null;

  return (
    <div className="rounded-md border">
      {groupedAttempts ? (
        Object.entries(groupedAttempts).map(([type, group]) => (
          <Fragment key={type}>
            <div className="p-4 font-bold capitalize bg-gray-50 border-b border-t text-sm">
              {type} Quizzes
            </div>
            <div className="divide-y">
              {group.map((attempt) => renderAttemptRow(attempt))}
            </div>
          </Fragment>
        ))
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b text-xs sm:text-sm">
            <div>Date</div>
            <div>Type</div>
            <div>Score</div>
            <div>Time Taken</div>
          </div>
          <div className="divide-y">{attempts.map(renderAttemptRow)}</div>
        </>
      )}
    </div>
  );
}
