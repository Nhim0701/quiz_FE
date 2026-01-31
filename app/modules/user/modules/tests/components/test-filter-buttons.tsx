import {
  LayoutGrid,
  Flag,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import {
  type TestFilterType,
  TEST_FILTERS,
  TEST_FILTER_CONFIG,
} from "../constants";
import { FilterButtons } from "./filter-buttons";

const TEST_FILTER_ICONS = {
  LayoutGrid,
  Flag,
  CheckCircle,
  HelpCircle,
} as const;

interface TestFilterButtonsProps {
  filter: TestFilterType;
  setFilter: (f: TestFilterType) => void;
  hasNotAnswered: boolean;
}

export const TestFilterButtons = ({
  filter,
  setFilter,
  hasNotAnswered,
}: TestFilterButtonsProps) => {
  const filterKeys: TestFilterType[] = [
    TEST_FILTERS.ALL,
    TEST_FILTERS.ANSWERED,
    TEST_FILTERS.FLAGGED,
  ];
  if (hasNotAnswered) {
    filterKeys.push(TEST_FILTERS.NOT_ANSWERED);
  }

  return (
    <FilterButtons
      filter={filter}
      setFilter={setFilter}
      filterKeys={filterKeys}
      config={TEST_FILTER_CONFIG}
      icons={TEST_FILTER_ICONS as any}
    />
  );
};
