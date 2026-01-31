import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib";
import type { QuestionProps } from "@/hooks";
import Html from "@/components/editor/html";

interface AnswerOptionsProps {
  question: QuestionProps;
  selectedAnswers: string[];
  isRevealed: boolean;
  onToggleAnswer: (answerId: string) => void;
}

export const AnswerOptions = ({
  question,
  selectedAnswers,
  isRevealed,
  onToggleAnswer,
}: AnswerOptionsProps) => {
  return (
    <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
      {question.answers.map((answer, idx) => {
        const isSelected = selectedAnswers.includes(answer.id);
        const isCorrect = answer.isCorrect;

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
          <Button
            key={answer.id}
            onClick={() => !isRevealed && onToggleAnswer(answer.id)}
            disabled={isRevealed}
            variant="outline"
            className={cn(
              "w-full !justify-start !items-center text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200",
              "!h-auto !px-3 sm:!px-4 !py-3 sm:!py-4",
              statusClass,
              isRevealed ? "cursor-default" : "cursor-pointer group",
              "hover:!bg-transparent focus-visible:!ring-0 focus-visible:!ring-offset-0"
            )}
          >
            <div className="flex items-center gap-3 sm:gap-4 w-full">
              <div
                className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base font-semibold ${badgeClass}`}
              >
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="flex-1 text-sm sm:text-base text-slate-700 dark:text-slate-200 break-words whitespace-normal">
                <Html content={answer.content} />
              </span>
              {showIndicator && indicatorIcon}
            </div>
          </Button>
        );
      })}
    </div>
  );
};
