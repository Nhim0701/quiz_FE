import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronRight } from "lucide-react";
import { useResultStore } from "../../../hooks/useResult";

export function ResultReview() {
  const { questions, answers } = useResultStore();
  const [visibleExplanations, setVisibleExplanations] = useState<
    Record<number, boolean>
  >({});

  if (!questions || questions.length === 0 || !answers) {
    return null;
  }

  const toggleExplanation = (questionId: number) => {
    setVisibleExplanations((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">
        Your Answers
      </h2>
      <div className="space-y-4 sm:space-y-6">
        {questions.map((question, idx) => {
          const userAnswerIds = answers[question.id] || [];
          const userAnswers = question.answers.filter((a) =>
            userAnswerIds.includes(a.id)
          );

          return (
            <div
              key={question.id}
              className="border-b border-slate-200 dark:border-slate-700 last:border-0 pb-4 sm:pb-6 last:pb-0"
            >
              {/* Question */}
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center text-sm sm:text-base">
                  {idx + 1}
                </span>
                <p className="flex-1 text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                  {question.content}
                </p>
              </div>

              {/* All Options */}
              <div className="ml-9 sm:ml-11 space-y-2 mb-3">
                {[...question.answers]
                  .sort((a, b) => a.id - b.id)
                  .map((answer, ansIdx) => {
                    const isSelected = userAnswerIds.includes(answer.id);
                    return (
                      <div
                        key={answer.id}
                        className={`p-2.5 sm:p-3 rounded-lg border-2 ${
                          isSelected
                            ? "border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30"
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span
                            className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs sm:text-sm font-medium ${
                              isSelected
                                ? "bg-blue-600 dark:bg-blue-500 text-white"
                                : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {String.fromCharCode(65 + ansIdx)}
                          </span>
                          <span className="text-slate-700 dark:text-slate-200 text-sm sm:text-base">
                            {answer.content}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Show explanation toggle if available */}
              {question.answers.some((a) => a.explanation) && (
                <div className="ml-9 sm:ml-11">
                  <button
                    onClick={() => toggleExplanation(question.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <ChevronRight
                      className={`w-4 h-4 transition-transform duration-200 ${
                        visibleExplanations[question.id] ? "rotate-90" : ""
                      }`}
                    />
                    {visibleExplanations[question.id]
                      ? "Hide Explanation"
                      : "Show Explanation"}
                  </button>

                  {visibleExplanations[question.id] && (
                    <div className="mt-2 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
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
                            Explanation
                          </h4>
                          <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 space-y-2 sm:space-y-3">
                            {(() => {
                              const sortedAnswers = [...question.answers].sort(
                                (a, b) => a.id - b.id
                              );
                              return sortedAnswers
                                .filter((a) => a.is_correct && a.explanation)
                                .map((answer) => (
                                  <div
                                    key={answer.id}
                                    className="prose prose-sm dark:prose-invert max-w-none"
                                  >
                                    {sortedAnswers.filter(
                                      (a) => a.is_correct && a.explanation
                                    ).length > 1 && (
                                      <strong className="block mb-1 text-blue-900 dark:text-blue-200">
                                        Answer{" "}
                                        {String.fromCharCode(
                                          65 + sortedAnswers.indexOf(answer)
                                        )}
                                        :
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
                                ));
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Unanswered */}
              {userAnswers.length === 0 && (
                <div className="ml-9 sm:ml-11 p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                    Not answered
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

