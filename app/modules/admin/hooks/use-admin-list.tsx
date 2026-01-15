import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation, type TranslationKey } from "@/i18n";
import { usePaginationStore, type FilterColorKey } from "@/hooks";
import {
  useFilterActions,
  useFilterHandlers,
  useFilterIdsConfig,
  createStringConverter,
  createStringFilterHandler,
  useAdminListData,
  type ActiveFilter,
} from "@/hooks";

export interface UseAdminListConfig {
  hookId: string;
  searchFilterKey?: string;
  searchPlaceholderKey?: string;
  fetchFunction: (
    page: number,
    pageSize: number,
    filters?: Record<string, string>
  ) => Promise<any>;
  onClearFiltersReady?: (clearFilters: () => void) => void;
  additionalFilters?: Array<{
    filterKey: string;
    value: any;
    defaultValue: any;
    converter: ReturnType<typeof createStringConverter>;
    handler: (value: any) => void;
  }>;
  filterColorMap?: Record<string, string>;
}

export function useAdminList({
  hookId,
  searchFilterKey = "name",
  searchPlaceholderKey,
  fetchFunction,
  onClearFiltersReady,
  additionalFilters = [],
  filterColorMap = {},
}: UseAdminListConfig) {
  const { t } = useTranslation();
  const { page, pageSize, total, setPage } = usePaginationStore();

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const filterConfig = useMemo(
    () => [
      {
        filterKey: searchFilterKey,
        value: searchValue,
        defaultValue: "",
        converter: createStringConverter(),
      },
      ...additionalFilters.map((f) => ({
        filterKey: f.filterKey,
        value: f.value,
        defaultValue: f.defaultValue,
        converter: f.converter,
      })),
    ],
    [searchFilterKey, searchValue, additionalFilters]
  );

  const filterHandlersMap = useMemo(
    () => ({
      [searchFilterKey]: createStringFilterHandler((value) => {
        setSearchInput(value);
        setSearchValue(value);
      }),
      ...additionalFilters.reduce(
        (acc, f) => {
          acc[f.filterKey] = f.handler;
          return acc;
        },
        {} as Record<string, (value: any) => void>
      ),
    }),
    [searchFilterKey, additionalFilters]
  );

  const {
    apiFilters,
    hasInitialFetch,
    handlePageChange,
    handlePageSizeChange,
  } = useAdminListData({
    hookId,
    filterConfig,
    filterHandlers: filterHandlersMap,
    fetchFunction,
    onFilterAppliedFromUrl: setSearchInput,
  });

  const resetSearchFilter = useCallback(() => {
    setSearchInput("");
    setSearchValue("");
  }, []);

  const filterHandlers = useMemo(
    () => [
      {
        filterId: searchFilterKey,
        resetValue: resetSearchFilter,
      },
      ...additionalFilters.map((f) => ({
        filterId: f.filterKey,
        resetValue: () => f.handler(f.defaultValue),
      })),
    ],
    [searchFilterKey, resetSearchFilter, additionalFilters]
  );

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

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (searchValue) {
      filters.push({
        id: searchFilterKey,
        label:
          t(`admin.${hookId}.columns.${searchFilterKey}` as TranslationKey) ||
          searchFilterKey,
        value: searchValue,
      });
    }
    return filters;
  }, [searchValue, searchFilterKey, hookId, t]);

  const filterIdsConfig = useFilterIdsConfig({
    handlers: filterHandlers,
    colorMap: {
      [searchFilterKey]: "blue",
      ...filterColorMap,
    } as Partial<Record<string, FilterColorKey>>,
  });

  const handleSearch = useCallback(() => {
    setSearchValue(searchInput);
    setPage(1);
  }, [searchInput, setPage]);

  const filterActionButtons = useFilterActions({
    onSearch: handleSearch,
    activeFilters,
    onClearFilters: handleClearAllFilters,
  });

  const paginationProps = useMemo(
    () => ({
      page,
      pageSize,
      total,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    }),
    [page, pageSize, total, handlePageChange, handlePageSizeChange]
  );

  return {
    searchInput,
    setSearchInput,
    searchValue,
    setSearchValue,
    apiFilters,
    hasInitialFetch,
    handlePageChange,
    handlePageSizeChange,
    handleRemoveFilter,
    handleClearAllFilters,
    activeFilters,
    filterIdsConfig,
    filterActionButtons,
    paginationProps,
    handleSearch,
  };
}
