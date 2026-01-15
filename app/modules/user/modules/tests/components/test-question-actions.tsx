import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n";

interface QuestionActionsProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  isFlagged: boolean;
  onGoPrevious: () => void;
  onGoNext: () => void;
  onToggleFlag: () => void;
}

export const QuestionActions = ({
  canGoPrevious,
  canGoNext,
  isFlagged,
  onGoPrevious,
  onGoNext,
  onToggleFlag,
}: QuestionActionsProps) => {
  return (
    <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
      <div className="flex gap-2 sm:gap-3">
        <Button
          onClick={onGoPrevious}
          disabled={!canGoPrevious}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 sm:gap-2"
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
        </Button>
        <Button
          onClick={onGoNext}
          disabled={!canGoNext}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 sm:gap-2"
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
        </Button>
      </div>

      <div className="flex gap-2 sm:gap-3">
        <Button
          onClick={onToggleFlag}
          variant={isFlagged ? "secondary" : "outline"}
          size="sm"
          className={`flex items-center gap-1.5 sm:gap-2 ${
            isFlagged
              ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/70"
              : ""
          }`}
        >
          <Flag
            className="w-4 h-4"
            fill={isFlagged ? "currentColor" : "none"}
          />
          {t("ui.buttons.flag")}
        </Button>
      </div>
    </div>
  );
};
