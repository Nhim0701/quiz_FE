import { useState } from "react";
import { useTranslation } from "@/i18n";
import type { QuestionProps } from "@/modules/admin/modules/questions/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ResultFilterType,
  type ResultQuestionStatus,
} from "../constants";
import { useIsMobileOrTablet } from "../hooks";
import { ResultFilterButtons } from "./result-filter-buttons";
import { ResultQuestionGrid } from "./result-question-grid";
import { SidebarShell } from "./sidebar-shell";

export type { ResultFilterType };

export interface FilteredQuestionItem {
  question: QuestionProps;
  originalIndex: number;
  status: ResultQuestionStatus;
  isFlagged: boolean;
}

interface ResultSidebarContentProps {
  filter: ResultFilterType;
  setFilter: (f: ResultFilterType) => void;
  filteredQuestions: FilteredQuestionItem[];
  hasNotAnswered: boolean;
  onQuestionClick?: (questionId: string) => void;
}

const ResultSidebarContent = ({
  filter,
  setFilter,
  filteredQuestions,
  hasNotAnswered,
  onQuestionClick,
}: ResultSidebarContentProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">
          {t("ui.headers.questions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResultFilterButtons
          filter={filter}
          setFilter={setFilter}
          hasNotAnswered={hasNotAnswered}
        />
        <ResultQuestionGrid
          filteredQuestions={filteredQuestions}
          onQuestionClick={onQuestionClick}
        />
      </CardContent>
    </Card>
  );
};

interface ResultSidebarProps {
  filter: ResultFilterType;
  setFilter: (f: ResultFilterType) => void;
  filteredQuestions: FilteredQuestionItem[];
  hasNotAnswered: boolean;
  onQuestionClick?: (questionId: string) => void;
}

export const ResultSidebar = ({
  filter,
  setFilter,
  filteredQuestions,
  hasNotAnswered,
  onQuestionClick,
}: ResultSidebarProps) => {
  const { t } = useTranslation();
  const isMobileOrTablet = useIsMobileOrTablet();
  const [open, setOpen] = useState(false);

  const handleQuestionClick = (questionId: string) => {
    onQuestionClick?.(questionId);
    if (isMobileOrTablet) setOpen(false);
  };

  const content = (
    <ResultSidebarContent
      filter={filter}
      setFilter={setFilter}
      filteredQuestions={filteredQuestions}
      hasNotAnswered={hasNotAnswered}
      onQuestionClick={handleQuestionClick}
    />
  );

  return (
    <SidebarShell
      isMobileOrTablet={isMobileOrTablet}
      open={open}
      onOpenChange={setOpen}
      sheetTitle={t("ui.headers.questions")}
      sheetAriaLabel="Open question navigator"
    >
      {content}
    </SidebarShell>
  );
};
