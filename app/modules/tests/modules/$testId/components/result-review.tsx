import ReactMarkdown from "react-markdown";
import { Check, X, Info } from "lucide-react";
import { useState } from "react";
import { useResultStore } from "@/hooks/useResult";
import { useTranslation } from "@/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResultSidebar } from "./result-sidebar";

export function ResultReview() {
  const { t } = useTranslation();
  const { questions, answers } = useResultStore();
  const [openQuestion, setOpenQuestion] = useState<string | undefined>(undefined);

  if (!questions || questions.length === 0 || !answers) {
    return null;
  }

  const handleQuestionClick = (questionId: string) => {
    setOpenQuestion(`question-${questionId}`);
    // Scroll after a short delay to ensure accordion is open
    setTimeout(() => {
      const element = document.getElementById(`question-${questionId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Main Review Area */}
      <div className="lg:col-span-3 w-full">
        <Card className="p-4 sm:p-8">
          <CardHeader className="p-0 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl">
              {t("ui.headers.yourAnswers")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
          <Accordion 
            type="single" 
            collapsible 
            className="w-full"
            value={openQuestion}
            onValueChange={setOpenQuestion}
          >
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

          return (
            <AccordionItem
              key={question.id}
              value={`question-${question.id}`}
              id={`question-${question.id}`}
              className="border-b border-slate-200 dark:border-slate-700 last:border-0"
            >
              <AccordionTrigger className="hover:no-underline py-4 sm:py-6">
                <div className="flex items-start gap-2 sm:gap-3 w-full text-left">
                  <Badge
                    variant="outline"
                    className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-semibold flex items-center justify-center text-sm sm:text-base ${
                      userSelectedAllCorrect
                        ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
                        : userAnswers.length > 0
                          ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
                          : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                    }`}
                  >
                    {idx + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 dark:text-slate-100 text-sm sm:text-base pr-4">
                      {question.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {userSelectedAllCorrect ? (
                        <Badge variant="outline" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                          <Check className="w-3 h-3 mr-1" />
                          {t("result.review.correct")}
                        </Badge>
                      ) : userAnswers.length > 0 ? (
                        <Badge variant="outline" className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700">
                          <X className="w-3 h-3 mr-1" />
                          {t("result.review.incorrect")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">
                          {t("ui.status.notAnswered")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4 sm:pb-6">
                <div className="ml-9 sm:ml-11 space-y-4">
                  {/* All Options */}
                  <div className="space-y-2">
                    {question.answers.map((answer, ansIdx) => {
                      const isSelected = userAnswerIds.includes(answer.id);
                      const isCorrect = answer.isCorrect;

                      return (
                        <Card
                          key={answer.id}
                          className={`p-2.5 sm:p-3 border-2 ${
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
                            <Badge
                              variant="outline"
                              className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs sm:text-sm font-medium p-0 ${
                                isSelected && isCorrect
                                  ? "bg-green-600 dark:bg-green-500 text-white border-green-600 dark:border-green-500"
                                  : isSelected && !isCorrect
                                    ? "bg-red-600 dark:bg-red-500 text-white border-red-600 dark:border-red-500"
                                    : isCorrect
                                      ? "bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                                      : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                              }`}
                            >
                              {String.fromCharCode(65 + ansIdx)}
                            </Badge>
                            <span className="text-slate-700 dark:text-slate-200 text-sm sm:text-base flex-1 break-words whitespace-normal">
                              {answer.content}
                            </span>
                            {isCorrect && (
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            )}
                            {isSelected && !isCorrect && (
                              <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {question.answers.some((a) => a.isCorrect && a.explanation) && (
                    <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                      <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                      <AlertTitle className="text-sm sm:text-base">
                        {t("ui.explanation.title")}
                      </AlertTitle>
                      <AlertDescription className="text-xs sm:text-sm">
                        <div className="space-y-2 sm:space-y-3 text-blue-800 dark:text-blue-300">
                          {question.answers
                            .filter((a) => a.isCorrect && a.explanation)
                            .map((answer) => (
                              <div
                                key={answer.id}
                                className="prose prose-sm dark:prose-invert max-w-none"
                              >
                                {question.answers.filter(
                                  (a) => a.isCorrect && a.explanation
                                ).length > 1 && (
                                  <strong className="block mb-1 text-blue-900 dark:text-blue-200">
                                    {t("result.review.answer")}{" "}
                                    {String.fromCharCode(
                                      65 + question.answers.indexOf(answer)
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
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      </CardContent>
    </Card>
      </div>

      {/* Sidebar - Desktop: sticky, Mobile: floating button with sheet */}
      <ResultSidebar onQuestionClick={handleQuestionClick} />
    </div>
  );
}
