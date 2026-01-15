import { useCallback, useEffect } from "react";
import {
  usePaginationStore,
  useFilterHandlers,
  useFilterIdsConfig,
  useFilterActions,
} from "@/hooks";
import type { ActiveFilter, FilterColorKey } from "@/components/common/filters";

export interface FilterHandlerConfig {
  filterId: string;
  resetValue: () => void;
  color?: string;
}

export interface UseAdminListFiltersConfig {
  filterHandlers: FilterHandlerConfig[];
  activeFilters: ActiveFilter[];
  onClearFiltersReady?: (clearFilters: () => void) => void;
}

export function useAdminListFilters({
  filterHandlers,
  activeFilters,
  onClearFiltersReady,
}: UseAdminListFiltersConfig) {
  const { setPage } = usePaginationStore();

  const handleFilterChange = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers({
    handlers: filterHandlers,
    onFilterChange: handleFilterChange,
  });

  useEffect(() => {
    if (onClearFiltersReady) {
      onClearFiltersReady(handleClearAllFilters);
    }
  }, [onClearFiltersReady, handleClearAllFilters]);

  const filterIdsConfig = useFilterIdsConfig({
    handlers: filterHandlers,
    colorMap: filterHandlers.reduce(
      (acc, handler) => {
        if (handler.color) {
          acc[handler.filterId] = handler.color as FilterColorKey;
        }
        return acc;
      },
      {} as Partial<Record<string, FilterColorKey>>
    ),
  });

  const handleSearch = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const filterActionButtons = useFilterActions({
    onSearch: handleSearch,
    activeFilters,
    onClearFilters: handleClearAllFilters,
  });

  return {
    filterIdsConfig,
    filterActionButtons,
    handleRemoveFilter,
    handleClearAllFilters,
  };
}
