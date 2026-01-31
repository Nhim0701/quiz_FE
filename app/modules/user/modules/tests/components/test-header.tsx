import { useEffect, useState, useMemo, useCallback } from "react";
import { X, Pause, Play } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useTestStore } from "../hooks";
import { useNavigate, useParams } from "react-router";
import { ROUTES } from "../constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestTimerBadge } from "./test-timer-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    timeStarted,
    startTimer,
    isPaused,
    pauseTest,
    resumeTest,
    clearPause,
  } = useTestStore();
  const [showTimeExpiredDialog, setShowTimeExpiredDialog] = useState(false);
  const [showPausedDialog, setShowPausedDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  useEffect(() => {
    setShowTimeExpiredDialog(false);
  }, [testId]);

  useEffect(() => {
    if (
      test &&
      !loading &&
      questions.length > 0 &&
      !isPaused &&
      !timeStarted
    ) {
      startTimer();
    }
  }, [test, loading, questions.length, isPaused, timeStarted, startTimer]);

  const handleCloseClick = useCallback(() => {
    setShowCloseDialog(true);
  }, []);

  const handleCloseKeepProgress = useCallback(() => {
    setShowCloseDialog(false);
    if (testId && !isPaused) {
      pauseTest(testId);
    }
    navigate(ROUTES.INDEX);
  }, [navigate, testId, isPaused, pauseTest]);

  const handleCloseDiscardProgress = useCallback(() => {
    setShowCloseDialog(false);
    if (testId) {
      clearPause(testId);
    }
    navigate(ROUTES.INDEX);
  }, [navigate, testId, clearPause]);

  const handlePause = useCallback(() => {
    if (testId) {
      pauseTest(testId);
      setShowPausedDialog(true);
    }
  }, [testId, pauseTest]);

  const handleResume = useCallback(() => {
    if (testId) {
      resumeTest(testId);
    }
  }, [testId, resumeTest]);

  const handleResumeFromDialog = useCallback(() => {
    if (testId && resumeTest(testId)) {
      setShowPausedDialog(false);
    }
  }, [testId, resumeTest]);

  const handleTimeExpiredSubmit = useCallback(() => {
    setShowTimeExpiredDialog(false);
    finishTest(navigate, testId || "", (errorMessage) => {
      console.error(errorMessage);
    });
  }, [finishTest, navigate, testId]);

  const progressValue = useMemo(
    () =>
      questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0,
    [currentIndex, questions.length]
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
            <TestTimerBadge onExpired={() => setShowTimeExpiredDialog(true)} />
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
              onClick={handleCloseClick}
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

      <AlertDialog open={showTimeExpiredDialog} onOpenChange={setShowTimeExpiredDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ui.timerExpired.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("ui.timerExpired.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleTimeExpiredSubmit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("ui.timerExpired.submit")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPausedDialog} onOpenChange={setShowPausedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ui.paused.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("ui.paused.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleResumeFromDialog} className="bg-green-500 text-white hover:bg-green-600">
              {t("ui.paused.resumeTest")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ui.closeTest.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("ui.closeTest.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCloseDialog(false)}>
              {t("ui.closeTest.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseDiscardProgress}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("ui.closeTest.discardProgress")}
            </AlertDialogAction>
            <AlertDialogAction onClick={handleCloseKeepProgress} className="bg-green-500 text-white hover:bg-green-600">
              {t("ui.closeTest.keepProgress")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
