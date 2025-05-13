"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface TimerProps {
  initialTime: number // in seconds
  onTimeUp: () => void
}

export default function Timer({ initialTime, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp()
      return
    }

    // Set warning when less than 1 minute remains
    if (timeLeft <= 60 && !isWarning) {
      setIsWarning(true)
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, onTimeUp, isWarning])

  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-full ${
        isWarning ? "bg-red-100 text-red-600" : "bg-gray-100"
      }`}
    >
      <Clock className={`h-4 w-4 ${isWarning ? "text-red-600" : ""}`} />
      <span className={`font-medium ${isWarning ? "text-red-600" : ""}`}>{formattedTime}</span>
    </div>
  )
}
