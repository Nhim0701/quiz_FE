import { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { useTestStore } from "../hooks";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// Hook to detect mobile and tablet (< 1024px)
function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024); // lg breakpoint
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return isMobileOrTablet;
}

function TestSidebarContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  const {
    questions,
    answers,
    flags,
    revealed,
    currentIndex,
    submitting,
    goToQuestion,
    finishTest,
  } = useTestStore();

  const handleFinish = async () => {
    await finishTest(navigate, testId || "", (errorMessage) => {
      console.error(errorMessage);
    });
  };
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flags).filter(Boolean).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            {t("ui.headers.progress")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {t("ui.status.answered")}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {answeredCount} / {questions.length}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {t("ui.status.flagged")}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {flaggedCount}
              </span>
            </div>
          </div>
          <Button
            onClick={handleFinish}
            disabled={submitting}
            className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t("ui.buttons.submitting")}
              </>
            ) : (
              t("ui.buttons.finishTest")
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            {t("ui.headers.questions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const hasAnswer = !!answers[q.id]?.length;
              const isCurrentQ = idx === currentIndex;
              const isFlaggedQ = !!flags[q.id];
              const isQuestionRevealed = !!revealed[q.id];

              let isCorrect = false;
              if (isQuestionRevealed && hasAnswer) {
                const userAnswers = answers[q.id] || [];
                const correctAnswers = q.answers
                  .filter((a) => a.isCorrect)
                  .map((a) => a.id);

                isCorrect =
                  correctAnswers.length === userAnswers.length &&
                  correctAnswers.every((id) => userAnswers.includes(id));
              }

              let variant: "default" | "secondary" | "outline" = "outline";
              let className =
                "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300";

              if (isCurrentQ) {
                variant = "default";
                className =
                  "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600";
              } else if (isQuestionRevealed && hasAnswer) {
                variant = "secondary";
                className = isCorrect
                  ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70"
                  : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70";
              } else if (hasAnswer) {
                variant = "secondary";
                className =
                  "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/70";
              }

              return (
                <Button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  variant={variant}
                  size="icon"
                  className={`relative aspect-square rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${className}`}
                >
                  {idx + 1}
                  {isFlaggedQ && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-400 dark:bg-yellow-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TestSidebar() {
  const { t } = useTranslation();
  const isMobileOrTablet = useIsMobileOrTablet();
  const [open, setOpen] = useState(false);

  // Mobile/Tablet: Floating button with sheet
  if (isMobileOrTablet) {
    return (
      <>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
              aria-label="Open test navigator"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:max-w-sm overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>{t("ui.headers.progress")}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <TestSidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        {/* Empty div to maintain grid structure on mobile/tablet */}
        <div className="hidden lg:block" />
      </>
    );
  }

  // Desktop (≥ 1024px): Sticky sidebar
  return (
    <div className="lg:col-span-1 space-y-4 sm:space-y-6 lg:sticky lg:top-[88px] lg:z-40 lg:self-start">
      <TestSidebarContent />
    </div>
  );
}
