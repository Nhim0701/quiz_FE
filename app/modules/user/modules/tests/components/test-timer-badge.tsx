import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTestTimerStore } from "../hooks/use-test-timer";
import { useTestPauseStore } from "../hooks/use-test-pause";
import { TIME_CONSTANTS } from "../constants";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

interface TestTimerBadgeProps {
  onExpired: () => void;
}

export const TestTimerBadge = ({ onExpired }: TestTimerBadgeProps) => {
  const timeRemaining = useTestTimerStore((s) => s.timeRemaining);
  const timeStarted = useTestTimerStore((s) => s.timeStarted);
  const setTimeRemaining = useTestTimerStore((s) => s.setTimeRemaining);
  const isPaused = useTestPauseStore((s) => s.isPaused);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    if (!timeStarted || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      const current = useTestTimerStore.getState().timeRemaining;
      const next = current <= 0 ? 0 : current - 1;
      setTimeRemaining(next);
      if (next <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onExpiredRef.current();
      }
    }, TIME_CONSTANTS.TIMER_INTERVAL);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timeStarted, isPaused, setTimeRemaining]);

  const isTimeLow = timeRemaining <= 5 * 60;
  const formattedTime = formatTime(timeRemaining);

  return (
    <Badge
      variant="outline"
      className={`font-mono text-xs sm:text-sm font-semibold whitespace-nowrap ${isTimeLow
          ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 animate-pulse"
          : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
        }`}
    >
      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mr-1.5" />
      <span>{formattedTime}</span>
    </Badge>
  );
}
