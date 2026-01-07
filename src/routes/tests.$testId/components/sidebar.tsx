import { useTranslation } from "@/i18n";
import { useTestStore } from "@/hooks/useTest";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TIME_CONSTANTS, getTestResultRoute } from "@/constants";
import { SubmissionItem } from "@/types";
import useApp from "@/hooks/useApp";

export function TestSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useApp();
  const {
    questions,
    answers,
    flags,
    revealed,
    currentIndex,
    submitting,
    timeRemaining,
    category,
    testType,
    questionSet,
    goToQuestion,
    submitBulk,
    setTimeStarted,
    setSubmitting,
  } = useTestStore();

  const handleFinish = useCallback(async () => {
    // Stop timer
    setTimeStarted(false);

    const total = questions.length;
    const answered = Object.keys(answers).length;
    const initialTime = questions.length * TIME_CONSTANTS.SECONDS_PER_QUESTION;
    const timeSpent = initialTime - timeRemaining;

    // Build responses array for backend submission
    const submissions: SubmissionItem[] = [];
    for (const [questionId, selectedAnswerIds] of Object.entries(answers)) {
      const question = questions.find((q) => q.id === parseInt(questionId));
      if (!question) continue;

      for (const answerId of selectedAnswerIds) {
        const answer = question.answers.find((a) => a.id === answerId);
        if (!answer) continue;

        submissions.push({
          question_id: parseInt(questionId),
          selected_option_id: answerId,
          is_correct: answer.is_correct,
        });
      }
    }

    // Submit responses to backend
    if (submissions.length > 0) {
      setSubmitting(true);
      try {
        await submitBulk<void>(submissions);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.submitResponsesFailed");
        showError(errorMessage);
        // Continue to result page even if submission fails
      } finally {
        setSubmitting(false);
      }
    }

    const resultRoute = getTestResultRoute(
      category || testType || "",
      questionSet || undefined
    );
    navigate(resultRoute, {
      state: {
        answers,
        questions,
        summary: {
          total,
          answered,
          testType: category || testType,
          date: new Date().toISOString(),
          timeSpent,
          timeRemaining,
        },
      },
    });
  }, [
    questions,
    answers,
    timeRemaining,
    category,
    testType,
    setTimeStarted,
    setSubmitting,
    submitBulk,
    showError,
    navigate,
    t,
  ]);
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flags).filter(Boolean).length;

  return (
    <div className="lg:col-span-1 space-y-4 sm:space-y-6">
      {/* Summary Card */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 sm:mb-4 text-base sm:text-lg">
          {t("ui.headers.progress")}
        </h3>
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
            <span className="text-slate-600 dark:text-slate-400">{t("ui.status.flagged")}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {flaggedCount}
            </span>
          </div>
        </div>
        <button
          onClick={handleFinish}
          disabled={submitting}
          className="w-full mt-4 sm:mt-6 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 transition-all duration-200 font-semibold text-sm sm:text-base shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t("ui.buttons.submitting")}
            </>
          ) : (
            t("ui.buttons.finishTest")
          )}
        </button>
      </div>

      {/* Question Navigator */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 sm:mb-4 text-base sm:text-lg">
          {t("ui.headers.questions")}
        </h3>
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
                .filter((a) => a.is_correct)
                .map((a) => a.id);

              isCorrect =
                correctAnswers.length === userAnswers.length &&
                correctAnswers.every((id) => userAnswers.includes(id));
            }

            let bgClass =
              "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300";
            if (isCurrentQ) {
              bgClass = "bg-blue-600 dark:bg-blue-500 text-white";
            } else if (isQuestionRevealed && hasAnswer) {
              bgClass = isCorrect
                ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70"
                : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70";
            } else if (hasAnswer) {
              bgClass =
                "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/70";
            }

            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(idx)}
                className={`relative aspect-square rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${bgClass}`}
              >
                {idx + 1}
                {isFlaggedQ && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-400 dark:bg-yellow-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

