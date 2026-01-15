import { useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "@/i18n";
import {
  usePaginationStore,
  useApp,
  FilterManager,
  useSyncFilterToUrl,
  useApplyFilterFromUrl,
  type FilterValueConverter,
  type FilterHandler,
} from "@/hooks";

export interface FilterSyncConfig<T> {
  filterKey: string;
  value: T;
  converter: FilterValueConverter<T>;
  defaultValue: T;
}

interface UseAdminListDataOptions<TData, TMeta> {
  hookId: string;
  filterConfig: FilterSyncConfig<any>[];
  filterHandlers: Record<string, FilterHandler>;
  fetchFunction: (
    page: number,
    pageSize: number,
    filters?: Record<string, string>
  ) => Promise<{ data: TData[]; meta?: TMeta } | undefined>;
  onFilterAppliedFromUrl?: (searchInput: string) => void;
  getTotalFromResult?: (
    result: { data: TData[]; meta?: TMeta } | undefined
  ) => number;
}

export function useAdminListData<TData, TMeta extends { total?: number }>({
  hookId,
  filterConfig,
  filterHandlers,
  fetchFunction,
  onFilterAppliedFromUrl,
  getTotalFromResult,
}: UseAdminListDataOptions<TData, TMeta>) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { showError } = useApp();
  const { page, pageSize, setPage, setPageSize, setTotal } =
    usePaginationStore();

  const isApplyingFiltersFromUrl = useRef(false);
  const hasInitialFetch = useRef(false);

  const { hasFilterParams } = useApplyFilterFromUrl({
    filterHandlers,
    onFilterApplied: async () => {
      isApplyingFiltersFromUrl.current = true;
      hasInitialFetch.current = true;
      setPage(1);

      const urlFilters = FilterManager.extractFiltersFromUrl(searchParams);

      if (onFilterAppliedFromUrl) {
        const nameFilter = urlFilters.find(
          (f) => f.key === "name" || f.key === "fullName" || f.key === "content"
        );
        if (nameFilter) {
          onFilterAppliedFromUrl(nameFilter.value);
        }
      }

      try {
        const apiFilters = FilterManager.convertFiltersToApiParams(urlFilters);
        const result = await fetchFunction(1, pageSize, apiFilters);
        const totalCount = getTotalFromResult
          ? getTotalFromResult(result)
          : (result?.meta?.total ?? result?.data?.length ?? 0);
        setTotal(totalCount);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.fetchDashboardFailed");
        showError(errorMessage);
      } finally {
        isApplyingFiltersFromUrl.current = false;
      }
    },
    hookId,
  });

  useSyncFilterToUrl({
    filters: filterConfig,
    hookId,
  });

  const filterValuesString = useMemo(
    () =>
      JSON.stringify(
        filterConfig.map((f) => ({
          key: f.filterKey,
          value: f.value,
        }))
      ),
    [filterConfig]
  );

  const apiFilters = useMemo(() => {
    const activeFilters: Array<{ key: string; value: string }> = [];
    filterConfig.forEach((filter) => {
      const converted = filter.converter(filter.value);
      if (converted === null) return;

      const isActive = Array.isArray(converted)
        ? converted.length > 0
        : filter.defaultValue !== undefined
          ? converted !== filter.converter(filter.defaultValue)
          : converted !== "";

      if (isActive) {
        const filterValue = Array.isArray(converted)
          ? converted.join(",")
          : converted;
        activeFilters.push({
          key: filter.filterKey,
          value: filterValue,
        });
      }
    });
    return FilterManager.convertFiltersToApiParams(activeFilters);
  }, [filterConfig]);

  const apiFiltersString = useMemo(
    () => JSON.stringify(apiFilters),
    [apiFilters]
  );

  const memoizedFetchFunction = useRef(fetchFunction);
  const getTotalFromResultRef = useRef(getTotalFromResult);

  useEffect(() => {
    memoizedFetchFunction.current = fetchFunction;
    getTotalFromResultRef.current = getTotalFromResult;
  }, [fetchFunction, getTotalFromResult]);

  useEffect(() => {
    if (
      (hasFilterParams && !hasInitialFetch.current) ||
      isApplyingFiltersFromUrl.current
    ) {
      return;
    }

    const loadData = async () => {
      try {
        const result = await memoizedFetchFunction.current(
          page,
          pageSize,
          apiFilters
        );
        const totalCount = getTotalFromResultRef.current
          ? getTotalFromResultRef.current(result)
          : (result?.meta?.total ?? result?.data?.length ?? 0);
        setTotal(totalCount);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.fetchDashboardFailed");
        showError(errorMessage);
      } finally {
        hasInitialFetch.current = true;
      }
    };

    loadData();
  }, [
    page,
    pageSize,
    apiFiltersString,
    hasFilterParams,
    setTotal,
    showError,
    t,
  ]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
    },
    [setPageSize]
  );

  return {
    apiFilters,
    hasFilterParams,
    isApplyingFiltersFromUrl,
    hasInitialFetch,
    handlePageChange,
    handlePageSizeChange,
  };
}
