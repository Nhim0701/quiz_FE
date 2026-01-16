import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { t } from "@/i18n";
import type { QuestionProps } from "@/hooks";
import Html from "@/components/editor/html";

interface QuestionHeaderProps {
  currentIndex: number;
  hasMultipleCorrect: boolean;
  isFlagged: boolean;
  currentQuestion: QuestionProps;
}

export const QuestionHeader = ({
  currentIndex,
  hasMultipleCorrect,
  isFlagged,
  currentQuestion,
}: QuestionHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-5 sm:mb-6">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Badge className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm sm:text-base font-bold justify-center">
            {currentIndex + 1}
          </Badge>
          {hasMultipleCorrect && (
            <Badge
              variant="outline"
              className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
            >
              {t("ui.status.multipleAnswers")}
            </Badge>
          )}
          {isFlagged && (
            <Badge
              variant="outline"
              className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 flex items-center gap-1"
            >
              <Flag className="w-3 h-3" />
              {t("ui.status.flagged")}
            </Badge>
          )}
        </div>
        <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed">
          <Html content={currentQuestion.content} />
        </p>
      </div>
    </div>
  );
};
