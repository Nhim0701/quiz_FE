import {
  LayoutGrid,
  Flag,
  CheckCircle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import {
  type ResultFilterType,
  RESULT_FILTERS,
  RESULT_FILTER_CONFIG,
} from "../constants";
import { FilterButtons } from "./filter-buttons";

const RESULT_FILTER_ICONS = {
  LayoutGrid,
  Flag,
  CheckCircle,
  XCircle,
  HelpCircle,
} as const;

interface ResultFilterButtonsProps {
  filter: ResultFilterType;
  setFilter: (f: ResultFilterType) => void;
  hasNotAnswered: boolean;
}

export const ResultFilterButtons = ({
  filter,
  setFilter,
  hasNotAnswered,
}: ResultFilterButtonsProps) => {
  const filterKeys: ResultFilterType[] = [
    RESULT_FILTERS.ALL,
    RESULT_FILTERS.FLAGGED,
    RESULT_FILTERS.CORRECT,
    RESULT_FILTERS.INCORRECT,
  ];
  if (hasNotAnswered) {
    filterKeys.push(RESULT_FILTERS.NOT_ANSWERED);
  }

  return (
    <FilterButtons
      filter={filter}
      setFilter={setFilter}
      filterKeys={filterKeys}
      config={RESULT_FILTER_CONFIG}
      icons={RESULT_FILTER_ICONS as any}
    />
  );
};
