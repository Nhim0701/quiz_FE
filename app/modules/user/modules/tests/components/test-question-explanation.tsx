import { TestAnswerOptionExplanation } from "./test-anwser-option-explanation";
import type { QuestionProps } from "@/hooks";
import { t } from "@/i18n";

interface QuestionExplanationProps {
  question: QuestionProps;
}

export const QuestionExplanation = ({ question }: QuestionExplanationProps) => {
  return (
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
            {question.answers.map((answer, index) => (
              <TestAnswerOptionExplanation
                key={answer.id}
                index={index}
                content={answer.explanation || ""}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
