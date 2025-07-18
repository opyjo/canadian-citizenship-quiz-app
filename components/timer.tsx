"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  timeRemaining: number; // in seconds
  onTimeUp: () => void;
}

export default function Timer({ timeRemaining, onTimeUp }: TimerProps) {
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    // Set warning when less than 1 minute remains
    if (timeRemaining <= 60 && !isWarning) {
      setIsWarning(true);
    }
  }, [timeRemaining, onTimeUp, isWarning]);

  // Format time as MM:SS
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        isWarning ? "bg-red-100" : "bg-gray-100"
      }`}
    >
      <Clock
        className={`h-5 w-5 ${isWarning ? "text-red-600" : "text-gray-600"}`}
      />
      <span
        className={`font-mono text-lg ${
          isWarning ? "text-red-600" : "text-gray-600"
        }`}
      >
        {formattedTime}
      </span>
    </div>
  );
}
