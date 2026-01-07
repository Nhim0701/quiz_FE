import ReactMarkdown from "react-markdown";
import { Check, X, Flag } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { useTestStore } from "../../../hooks/useTest";

export function TestQuestion() {
  const { t } = useTranslation();
  const {
    questions,
    currentIndex,
    answers,
    flags,
    revealed,
    toggleAnswer,
    toggleFlag,
    toggleRevealed,
    goPrev,
    goNext,
  } = useTestStore();

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return null;
  }

  const selectedAnswers = answers[currentQuestion.id] || [];
  const isFlagged = !!flags[currentQuestion.id];
  const isRevealed = !!revealed[currentQuestion.id];
  const hasAnswered = selectedAnswers.length > 0;

  // Check if current question has multiple correct answers
  const correctAnswersCount = currentQuestion.answers.filter(
    (a) => a.is_correct
  ).length;
  const hasMultipleCorrect = correctAnswersCount > 1;

  const sortedAnswers = [...currentQuestion.answers].sort((a, b) => a.id - b.id);

  const handleToggleAnswer = (answerId: number) => {
    toggleAnswer(currentQuestion.id, answerId);
  };

  const handleToggleFlag = () => {
    toggleFlag(currentQuestion.id);
  };

  const handleGoNext = () => {
    if (hasAnswered) {
      toggleRevealed(currentQuestion.id);
    }
    goNext();
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < questions.length - 1;

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-5 sm:p-8">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-5 sm:mb-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm sm:text-base font-bold">
              {currentIndex + 1}
            </span>
            {hasMultipleCorrect && (
              <span className="px-2 sm:px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                {t("ui.status.multipleAnswers")}
              </span>
            )}
            {isFlagged && (
              <span className="px-2 sm:px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full flex items-center gap-1">
                <Flag className="w-3 h-3" />
                {t("ui.status.flagged")}
              </span>
            )}
          </div>
          <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed">
            {currentQuestion.content}
          </p>
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
        {sortedAnswers.map((answer, idx) => {
          const isSelected = selectedAnswers.includes(answer.id);
          const isCorrect = answer.is_correct;

          let statusClass =
            "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50";
          let badgeClass =
            "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-600";
          let showIndicator = false;
          let indicatorIcon = null;

          if (isRevealed) {
            if (isCorrect) {
              statusClass =
                "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/30";
              badgeClass = "bg-green-600 dark:bg-green-500 text-white";
              showIndicator = true;
              indicatorIcon = (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              );
            } else if (isSelected && !isCorrect) {
              statusClass =
                "border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/30";
              badgeClass = "bg-red-600 dark:bg-red-500 text-white";
              showIndicator = true;
              indicatorIcon = (
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              );
            }
          } else if (isSelected) {
            statusClass =
              "border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30";
            badgeClass = "bg-blue-600 dark:bg-blue-500 text-white";
          }

          return (
            <button
              key={answer.id}
              onClick={() => !isRevealed && handleToggleAnswer(answer.id)}
              disabled={isRevealed}
              className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${statusClass} ${
                isRevealed ? "cursor-default" : "cursor-pointer group"
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base font-semibold ${badgeClass}`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="flex-1 text-sm sm:text-base text-slate-700 dark:text-slate-200">
                  {answer.content}
                </span>
                {showIndicator && indicatorIcon}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {isRevealed &&
        sortedAnswers.some((a) => a.is_correct && a.explanation) && (
          <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2 sm:gap-3">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1 text-sm sm:text-base">
                  {t("ui.explanation.title")}
                </h4>
                <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 space-y-2 sm:space-y-3">
                  {sortedAnswers
                    .filter((a) => a.is_correct && a.explanation)
                    .map((answer) => (
                      <div key={answer.id} className="prose prose-sm dark:prose-invert max-w-none">
                        {sortedAnswers.filter(
                          (a) => a.is_correct && a.explanation
                        ).length > 1 && (
                          <strong className="block mb-1 text-blue-900 dark:text-blue-200">
                            Answer {String.fromCharCode(65 + sortedAnswers.indexOf(answer))}:
                          </strong>
                        )}
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => (
                              <p
                                className="mb-2 leading-relaxed text-blue-800 dark:text-blue-300"
                                {...props}
                              />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                className="list-disc list-inside mb-2 space-y-1 text-blue-800 dark:text-blue-300"
                                {...props}
                              />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol
                                className="list-decimal list-inside mb-2 space-y-1 text-blue-800 dark:text-blue-300"
                                {...props}
                              />
                            ),
                            li: ({ node, ...props }) => (
                              <li
                                className="leading-relaxed text-blue-800 dark:text-blue-300"
                                {...props}
                              />
                            ),
                            code: ({ node, ...props }) => (
                              <code
                                className="block bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 p-2 rounded text-xs font-mono overflow-x-auto"
                                {...props}
                              />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong
                                className="font-bold text-blue-900 dark:text-blue-200"
                                {...props}
                              />
                            ),
                            em: ({ node, ...props }) => (
                              <em
                                className="italic text-blue-800 dark:text-blue-300"
                                {...props}
                              />
                            ),
                            a: ({ node, ...props }) => (
                              <a
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                {...props}
                              />
                            ),
                            h1: ({ node, ...props }) => (
                              <h1
                                className="text-base sm:text-lg font-bold mb-2 text-blue-900 dark:text-blue-200"
                                {...props}
                              />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2
                                className="text-sm sm:text-base font-bold mb-2 text-blue-900 dark:text-blue-200"
                                {...props}
                              />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3
                                className="text-xs sm:text-sm font-bold mb-1 text-blue-900 dark:text-blue-200"
                                {...props}
                              />
                            ),
                            blockquote: ({ node, ...props }) => (
                              <blockquote
                                className="border-l-4 border-blue-300 dark:border-blue-700 pl-3 italic my-2 text-blue-800 dark:text-blue-300"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {answer.explanation || ""}
                        </ReactMarkdown>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={goPrev}
            disabled={!canGoPrevious}
            className="px-2.5 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 sm:gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">{t("ui.buttons.previous")}</span>
            <span className="sm:hidden">{t("ui.buttons.prev")}</span>
          </button>
          <button
            onClick={handleGoNext}
            disabled={!canGoNext}
            className="px-2.5 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 sm:gap-2"
          >
            {t("ui.buttons.next")}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleToggleFlag}
            className={`px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-sm ${
              isFlagged
                ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
                : "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={isFlagged ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
            {t("ui.buttons.flag")}
          </button>
        </div>
      </div>
    </div>
  );
}

