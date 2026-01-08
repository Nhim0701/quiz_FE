import ReactMarkdown from "react-markdown";
import { Check, X } from "lucide-react";
import { useResultStore } from "@/hooks/useResult";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ResultReview() {
  const { questions, answers } = useResultStore();

  if (!questions || questions.length === 0 || !answers) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">
        Your Answers
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {questions.map((question, idx) => {
          const userAnswerIds = answers[question.id] || [];
          const userAnswers = question.answers.filter((a) =>
            userAnswerIds.includes(a.id)
          );
          const sortedAnswers = [...question.answers].sort(
            (a, b) => a.id - b.id
          );

          // Check if answer is correct
          const correctAnswers = sortedAnswers.filter((a) => a.is_correct);
          const userSelectedCorrect = userAnswers.every((a) => a.is_correct);
          const userSelectedAllCorrect =
            userAnswers.length === correctAnswers.length && userSelectedCorrect;

          return (
            <AccordionItem
              key={question.id}
              value={`question-${question.id}`}
              className="border-b border-slate-200 dark:border-slate-700 last:border-0"
            >
              <AccordionTrigger className="hover:no-underline py-4 sm:py-6">
                <div className="flex items-start gap-2 sm:gap-3 w-full text-left">
                  <span
                    className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-semibold flex items-center justify-center text-sm sm:text-base ${
                      userSelectedAllCorrect
                        ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                        : userAnswers.length > 0
                          ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                          : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 dark:text-slate-100 text-sm sm:text-base pr-4">
                      {question.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {userSelectedAllCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                          <Check className="w-3 h-3" />
                          Correct
                        </span>
                      ) : userAnswers.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                          <X className="w-3 h-3" />
                          Incorrect
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                          Not answered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4 sm:pb-6">
                <div className="ml-9 sm:ml-11 space-y-4">
                  {/* All Options */}
                  <div className="space-y-2">
                    {sortedAnswers.map((answer, ansIdx) => {
                      const isSelected = userAnswerIds.includes(answer.id);
                      const isCorrect = answer.is_correct;

                      return (
                        <div
                          key={answer.id}
                          className={`p-2.5 sm:p-3 rounded-lg border-2 ${
                            isSelected && isCorrect
                              ? "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/30"
                              : isSelected && !isCorrect
                                ? "border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/30"
                                : isCorrect
                                  ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20"
                                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30"
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span
                              className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs sm:text-sm font-medium ${
                                isSelected && isCorrect
                                  ? "bg-green-600 dark:bg-green-500 text-white"
                                  : isSelected && !isCorrect
                                    ? "bg-red-600 dark:bg-red-500 text-white"
                                    : isCorrect
                                      ? "bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300"
                                      : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              {String.fromCharCode(65 + ansIdx)}
                            </span>
                            <span className="text-slate-700 dark:text-slate-200 text-sm sm:text-base flex-1">
                              {answer.content}
                            </span>
                            {isCorrect && (
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            )}
                            {isSelected && !isCorrect && (
                              <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {sortedAnswers.some((a) => a.is_correct && a.explanation) && (
                    <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
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
                            {sortedAnswers
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
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
