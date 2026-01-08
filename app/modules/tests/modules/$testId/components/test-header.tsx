import { Clock } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useTestStore } from "@/hooks/useTest";
import { useNavigate } from "react-router";
import { ROUTES } from "@/constants";

export function TestHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    category,
    testType,
    questionSet,
    currentIndex,
    questions,
    timeRemaining,
  } = useTestStore();

  const handleClose = () => {
    navigate(ROUTES.TESTS);
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isTimeLow = timeRemaining <= 5 * 60;

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0 flex-1 pr-4">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize truncate">
            {category || testType} {questionSet && `- ${questionSet}`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("test.question", {
              current: currentIndex + 1,
              total: questions.length,
            } as any)}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-mono text-xs sm:text-sm font-semibold whitespace-nowrap ${
              isTimeLow
                ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 animate-pulse"
                : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
            }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex-shrink-0"
            aria-label={t("common.close")}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 transition-all duration-300"
          style={{
            width: `${
              questions.length > 0
                ? ((currentIndex + 1) / questions.length) * 100
                : 0
            }%`,
          }}
        ></div>
      </div>
    </div>
  );
}
