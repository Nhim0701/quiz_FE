import type { ReactNode } from "react";
import {
  SearchInput,
  ActiveFilters,
  FilterActions,
  type ActiveFilter,
  type FilterAction,
} from "@/components/common/filters";
import type { FilterIdsConfig } from "@/hooks";

export interface AdminListFiltersProps {
  searchInput?: {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
    placeholderKey: string;
    className?: string;
    searchKey: string;
  };
  additionalFilters?: ReactNode;
  activeFilters: ActiveFilter[];
  filterIdsConfig: FilterIdsConfig;
  filterActionButtons: FilterAction[];
  onRemoveFilter: (filterId: string) => void;
  className?: string;
}

export function AdminListFilters({
  searchInput,
  additionalFilters,
  activeFilters,
  filterIdsConfig,
  filterActionButtons,
  onRemoveFilter,
  className,
}: AdminListFiltersProps) {
  return (
    <>
      <div
        className={`mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className || ""}`}
      >
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {searchInput && (
            <SearchInput
              value={searchInput.value}
              onChange={searchInput.onChange}
              onSearch={searchInput.onSearch}
              placeholderKey={searchInput.placeholderKey}
              className={searchInput.className || "flex-1 min-w-[200px]"}
              searchKey={searchInput.searchKey}
            />
          )}
          {additionalFilters}
          <FilterActions buttons={filterActionButtons} />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-4">
          <ActiveFilters
            filters={activeFilters}
            onRemove={onRemoveFilter}
            filterIdsConfig={filterIdsConfig}
          />
        </div>
      )}
    </>
  );
}
