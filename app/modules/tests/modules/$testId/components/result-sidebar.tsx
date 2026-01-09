import { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { useResultStore } from "@/hooks/useResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Check, X, Menu } from "lucide-react";

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

interface ResultSidebarProps {
  onQuestionClick?: (questionId: string) => void;
}

function ResultSidebarContent({ onQuestionClick }: ResultSidebarProps) {
  const { t } = useTranslation();
  const { questions, answers } = useResultStore();

  if (!questions || questions.length === 0 || !answers) {
    return null;
  }

  const handleQuestionClick = (questionId: string) => {
    if (onQuestionClick) {
      onQuestionClick(questionId);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">
          {t("ui.headers.questions")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, idx) => {
            const userAnswerIds = answers[question.id] || [];
            const userAnswers = question.answers.filter((a) =>
              userAnswerIds.includes(a.id)
            );

            // Check if answer is correct
            const correctAnswers = question.answers.filter((a) => a.isCorrect);
            const userSelectedCorrect = userAnswers.every((a) => a.isCorrect);
            const userSelectedAllCorrect =
              userAnswers.length === correctAnswers.length && userSelectedCorrect;

            let variant: "default" | "secondary" | "outline" = "outline";
            let className = "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300";

            if (userSelectedAllCorrect) {
              variant = "secondary";
              className = "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70 border-green-300 dark:border-green-700";
            } else if (userAnswers.length > 0) {
              variant = "secondary";
              className = "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70 border-red-300 dark:border-red-700";
            } else {
              className = "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/70 border-amber-300 dark:border-amber-700";
            }

            return (
              <Button
                key={question.id}
                onClick={() => handleQuestionClick(question.id)}
                variant={variant}
                size="icon"
                className={`relative aspect-square rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${className}`}
                title={`${t("ui.headers.questions")} ${idx + 1}`}
              >
                {idx + 1}
                {userSelectedAllCorrect && (
                  <Check className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 dark:bg-green-500 text-white rounded-full p-0.5" />
                )}
                {userAnswers.length > 0 && !userSelectedAllCorrect && (
                  <X className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 dark:bg-red-500 text-white rounded-full p-0.5" />
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ResultSidebar({ onQuestionClick }: ResultSidebarProps) {
  const { t } = useTranslation();
  const isMobileOrTablet = useIsMobileOrTablet();
  const [open, setOpen] = useState(false);

  const handleQuestionClick = (questionId: string) => {
    if (onQuestionClick) {
      onQuestionClick(questionId);
    }
    // Close sheet on mobile/tablet after clicking
    if (isMobileOrTablet) {
      setOpen(false);
    }
  };

  // Mobile/Tablet: Floating button with sheet
  if (isMobileOrTablet) {
    return (
      <>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
              aria-label="Open question navigator"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t("ui.headers.questions")}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <ResultSidebarContent onQuestionClick={handleQuestionClick} />
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
      <ResultSidebarContent onQuestionClick={onQuestionClick} />
    </div>
  );
}
