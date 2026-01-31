import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { useTestStore, useIsMobileOrTablet } from "../hooks";
import { useNavigate, useParams } from "react-router";
import type { QuestionProps } from "@/modules/admin/modules/questions/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type TestFilterType, TEST_FILTERS } from "../constants";
import { TestAlertDialog } from "./test-alert-dialog";
import { TestFilterButtons } from "./test-filter-buttons";
import { SidebarShell } from "./sidebar-shell";

interface FilteredQuestionItem {
  question: QuestionProps;
  originalIndex: number;
}

function TestSidebarContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  const [filter, setFilter] = useState<TestFilterType>(TEST_FILTERS.ALL);
  const {
    questions,
    answers,
    flags,
    revealed,
    currentIndex,
    submitting,
    goToQuestion,
    finishTest,
    setFinishDialogOpen,
  } = useTestStore();

  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flags).filter(Boolean).length;
  const hasNotAnswered = answeredCount < questions.length;
  const unansweredCount = questions.length - answeredCount;

  useEffect(() => {
    setFinishDialogOpen(false);
  }, [testId, setFinishDialogOpen]);

  const handleFinishClick = () => {
    setFinishDialogOpen(true);
    setShowFinishDialog(true);
  };

  const handleFinishDialogOpenChange = (open: boolean) => {
    setShowFinishDialog(open);
    if (!open) setFinishDialogOpen(false);
  };

  const handleFinishConfirm = async () => {
    setShowFinishDialog(false);
    setFinishDialogOpen(false);
    await finishTest(navigate, testId || "", (errorMessage) => {
      console.error(errorMessage);
    });
  };

  const filteredQuestions = useMemo((): FilteredQuestionItem[] => {
    return questions
      .map((q, idx) => ({ question: q, originalIndex: idx }))
      .filter(({ question }) => {
        const hasAnswer = !!answers[question.id]?.length;
        const isFlagged = !!flags[question.id];
        switch (filter) {
          case TEST_FILTERS.ANSWERED:
            return hasAnswer;
          case TEST_FILTERS.NOT_ANSWERED:
            return !hasAnswer;
          case TEST_FILTERS.FLAGGED:
            return isFlagged;
          default:
            return true;
        }
      });
  }, [questions, answers, flags, filter]);

  return (
    <div className="space-y-4 sm:space-y-6">
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
            onClick={handleFinishClick}
            disabled={submitting}
            className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-amber-500 dark:to-yellow-500 hover:from-amber-600 hover:to-yellow-700 dark:hover:from-amber-600 dark:hover:to-yellow-600 shadow-sm"
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

      <TestAlertDialog
        open={showFinishDialog}
        onOpenChange={handleFinishDialogOpenChange}
        title={t("ui.finishTestConfirm.title")}
        description={
          hasNotAnswered
            ? t("ui.finishTestConfirm.withUnanswered" as any, {
                count: unansweredCount,
              })
            : t("ui.finishTestConfirm.allAnswered")
        }
        cancelLabel={t("ui.finishTestConfirm.cancel")}
        actions={[
          {
            label: t("ui.finishTestConfirm.submit"),
            onClick: handleFinishConfirm,
            variant: "amber",
            disabled: submitting,
          },
        ]}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            {t("ui.headers.questions")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TestFilterButtons
            filter={filter}
            setFilter={setFilter}
            hasNotAnswered={hasNotAnswered}
          />
          <div className="grid grid-cols-5 gap-2">
            {filteredQuestions.map(({ question: q, originalIndex: idx }) => {
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

  return (
    <SidebarShell
      isMobileOrTablet={isMobileOrTablet}
      open={open}
      onOpenChange={setOpen}
      sheetTitle={t("ui.headers.progress")}
      sheetAriaLabel="Open test navigator"
    >
      <TestSidebarContent />
    </SidebarShell>
  );
}
