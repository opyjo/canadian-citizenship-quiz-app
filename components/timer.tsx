"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  timeRemaining: number; // in seconds
  onTimeUp: () => void;
}

export default function Timer({ timeRemaining, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeRemaining);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    setTimeLeft(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  useEffect(() => {
    if (timeLeft <= 60 && !isWarning) {
      setIsWarning(true);
    } else if (timeLeft > 60 && isWarning) {
      setIsWarning(false);
    }
  }, [timeLeft, isWarning]);

  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
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
