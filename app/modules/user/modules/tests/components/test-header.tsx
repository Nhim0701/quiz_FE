import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Clock, X, Pause, Play } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useTestStore } from "../hooks";
import {
  useTestsStore,
  type TestProps,
} from "@/modules/admin/modules/tests/hooks";
import { useNavigate, useParams } from "react-router";
import { ROUTES, TIME_CONSTANTS } from "../constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTestTimerStore } from "../hooks/use-test-timer";

export function TestHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  const {
    test,
    currentIndex,
    questions,
    loading,
    finishTest,
    timeRemaining,
    timeStarted,
    startTimer,
    setTimeRemaining,
    isPaused,
    pauseTest,
    resumeTest,
  } = useTestStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const finishTestRef = useRef(finishTest);

  // Update ref when finishTest changes
  useEffect(() => {
    finishTestRef.current = finishTest;
  }, [finishTest]);

  useEffect(() => {
    if (test && !loading && questions.length > 0 && !isPaused && timeStarted) {
      startTimer();

      intervalRef.current = setInterval(() => {
        const currentTime = useTestTimerStore.getState().timeRemaining;

        setTimeRemaining(currentTime - 1);
        if (currentTime == 0) {
          intervalRef.current &&
            clearInterval(intervalRef.current as NodeJS.Timeout);
          intervalRef.current = null;
          finishTestRef.current(navigate, testId || "", (errorMessage) => {
            console.error(errorMessage);
          });
        }
      }, TIME_CONSTANTS.TIMER_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as NodeJS.Timeout);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as NodeJS.Timeout);
        intervalRef.current = null;
      }
    };
  }, [test, loading, questions.length, startTimer, navigate, testId, isPaused, timeStarted, setTimeRemaining]);

  const handleClose = useCallback(() => {
    if (testId && !isPaused) {
      pauseTest(testId);
    }
    navigate(ROUTES.INDEX);
  }, [navigate, testId, isPaused, pauseTest]);

  const handlePause = useCallback(() => {
    if (testId) {
      pauseTest(testId);
    }
  }, [testId, pauseTest]);

  const handleResume = useCallback(() => {
    if (testId) {
      resumeTest(testId);
    }
  }, [testId, resumeTest]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const isTimeLow = useMemo(() => timeRemaining <= 5 * 60, [timeRemaining]);

  const progressValue = useMemo(
    () =>
      questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0,
    [currentIndex, questions.length]
  );

  const formattedTime = useMemo(
    () => formatTime(timeRemaining),
    [formatTime, timeRemaining]
  );

  return (
    <Card className="p-4 sm:p-6">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 flex-1 pr-4">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize truncate">
              {test?.name || ""}
            </h1>
            {test?.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2">
                {test.description}
              </p>
            )}
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("test.question", {
                current: currentIndex + 1,
                total: questions.length,
              } as any)}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Badge
              variant="outline"
              className={`font-mono text-xs sm:text-sm font-semibold whitespace-nowrap ${
                isTimeLow
                  ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 animate-pulse"
                  : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mr-1.5" />
              <span>{formattedTime}</span>
            </Badge>
            {isPaused ? (
              <Button
                onClick={handleResume}
                variant="outline"
                size="icon"
                className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/70"
                aria-label={t("ui.buttons.resume")}
                title={t("ui.buttons.resume")}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                variant="outline"
                size="icon"
                className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/70"
                aria-label={t("ui.buttons.pause")}
                title={t("ui.buttons.pause")}
              >
                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              aria-label={t("common.close")}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 transition-all duration-300"
            style={{ width: `${progressValue}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
}
