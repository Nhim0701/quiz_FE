import type { ReactNode } from "react";
import {
  DataTable,
  type Column,
  type Action,
} from "@/components/common/data-table";
import {
  SearchInput,
  ActiveFilters,
  FilterActions,
  type ActiveFilter,
  type FilterAction,
} from "@/components/common/filters";
import type { FilterIdsConfig } from "@/hooks";

export interface AdminListProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  actions?: Action<T>[];
  loading?: boolean;
  emptyMessage?: string;
  searchInput?: {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
    placeholderKey?: string;
    searchKey?: string;
    className?: string;
  };
  additionalFilters?: ReactNode;
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (filterId: string) => void;
  filterIdsConfig?: FilterIdsConfig;
  filterActionButtons?: FilterAction[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  filterBarClassName?: string;
}

export function AdminList<T extends { id: string | number }>({
  columns,
  data,
  actions,
  loading = false,
  emptyMessage,
  searchInput,
  additionalFilters,
  activeFilters = [],
  onRemoveFilter,
  filterIdsConfig,
  filterActionButtons,
  pagination,
  filterBarClassName,
}: AdminListProps<T>) {
  return (
    <>
      {(searchInput || additionalFilters || filterActionButtons) && (
        <div
          className={`mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${filterBarClassName || ""}`}
        >
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {searchInput && (
              <SearchInput
                value={searchInput.value}
                onChange={searchInput.onChange}
                onSearch={searchInput.onSearch}
                placeholderKey={searchInput.placeholderKey || ""}
                className={searchInput.className || "flex-1 min-w-[200px]"}
                searchKey={searchInput.searchKey}
              />
            )}
            {additionalFilters}
            {filterActionButtons && (
              <FilterActions buttons={filterActionButtons} />
            )}
          </div>
        </div>
      )}

      {activeFilters.length > 0 && filterIdsConfig && onRemoveFilter && (
        <div className="mb-4">
          <ActiveFilters
            filters={activeFilters}
            onRemove={onRemoveFilter}
            filterIdsConfig={filterIdsConfig}
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        actions={actions}
        loading={loading}
        emptyMessage={emptyMessage}
        pagination={pagination}
        scroll
      />
    </>
  );
}
