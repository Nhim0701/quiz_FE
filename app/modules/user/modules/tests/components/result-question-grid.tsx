import { useTranslation } from "@/i18n";
import type { QuestionProps } from "@/modules/admin/modules/questions/types";
import { Button } from "@/components/ui/button";
import { Check, X, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { RESULT_QUESTION_STATUS } from "../constants";
import type { ResultQuestionStatus } from "../constants";
import type { FilteredQuestionItem } from "./result-sidebar";

interface ResultQuestionGridProps {
  filteredQuestions: FilteredQuestionItem[];
  onQuestionClick?: (questionId: string) => void;
}

const getQuestionButtonClass = (status: ResultQuestionStatus): string => {
  return status === RESULT_QUESTION_STATUS.CORRECT
    ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70 border-green-300 dark:border-green-700"
    : status === RESULT_QUESTION_STATUS.INCORRECT
      ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70 border-red-300 dark:border-red-700"
      : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/70 border-amber-300 dark:border-amber-700";
}

export const ResultQuestionGrid = ({
  filteredQuestions,
  onQuestionClick,
}: ResultQuestionGridProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-5 gap-2">
      {filteredQuestions.map(({ question, originalIndex, status, isFlagged }) => {
        const className = getQuestionButtonClass(status);
        return (
          <Button
            key={question.id}
            onClick={() => onQuestionClick?.(question.id)}
            variant="outline"
            size="icon"
            className={cn(
              "relative aspect-square rounded-lg font-medium text-xs sm:text-sm transition-all duration-200",
              className
            )}
            title={`${t("ui.headers.questions")} ${originalIndex + 1}${isFlagged ? ` (${t("ui.status.flagged")})` : ""}`}
          >
            {originalIndex + 1}
            {status === RESULT_QUESTION_STATUS.CORRECT && (
              <Check className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 dark:bg-green-500 text-white rounded-full p-0.5" />
            )}
            {status === RESULT_QUESTION_STATUS.INCORRECT && (
              <X className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 dark:bg-red-500 text-white rounded-full p-0.5" />
            )}
            {isFlagged && (
              <Flag className="absolute -top-1 -left-1 w-3 h-3 text-amber-600 dark:text-amber-500 fill-amber-500 dark:fill-amber-400" />
            )}
          </Button>
        );
      })}
    </div>
  );
}
