import { CheckCircle } from "lucide-react";
import { useTranslation } from "../../../i18n";

interface Summary {
  total: number;
  answered: number;
  testType?: string;
  date: string;
  timeSpent: number;
  timeRemaining: number;
}

interface ResultSummaryProps {
  summary: Summary;
  correctCount: number;
  wrongCount: number;
  accuracyPercentage: number;
  onBack: () => void;
  onRetake: () => void;
}

export function ResultSummary({
  summary,
  correctCount,
  wrongCount,
  accuracyPercentage,
  onBack,
  onRetake,
}: ResultSummaryProps) {
  const { t } = useTranslation();
  const completionPercentage = Math.round(
    (summary.answered / summary.total) * 100
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 sm:p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {t("ui.headers.testCompleted")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 capitalize">
          {summary.testType} {t("result.quiz")}
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-300 mb-2">
            {summary.total}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t("ui.headers.questions")}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-300 mb-2">
            {correctCount}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t("profile.stats.correctAnswers")}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-300 mb-2">
            {wrongCount}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t("result.wrong")}
          </div>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-300 mb-2">
            {accuracyPercentage}%
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t("profile.stats.averageScore")}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
          <span>{t("ui.headers.progress")}</span>
          <span>
            {summary.answered} / {summary.total}
          </span>
        </div>
        <div className="relative w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <button
          onClick={onBack}
          className="px-5 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          {t("ui.buttons.backToDashboard")}
        </button>
        <button
          onClick={onRetake}
          className="px-5 sm:px-8 py-2.5 sm:py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 font-semibold text-sm sm:text-base"
        >
          {t("ui.buttons.takeAnotherTest")}
        </button>
      </div>
    </div>
  );
}

