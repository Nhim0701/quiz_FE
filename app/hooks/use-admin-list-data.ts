import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useTranslation } from "@/i18n";
import {
  usePagination,
  useFilterParams,
  useApp,
  type FilterValueConverter,

} from "@/hooks";
import { camelToSnake } from "@/lib";

export interface FilterSyncConfig<T> {
  filterKey: string;
  value: T; // Used for initial value or controlled state, but we prefer URL.
  converter: FilterValueConverter<T>;
  defaultValue: T;
}

interface UseAdminListDataOptions<TData, TMeta> {

  filterConfig: FilterSyncConfig<any>[];

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

  filterConfig,

  fetchFunction,
  onFilterAppliedFromUrl,
  getTotalFromResult,
}: UseAdminListDataOptions<TData, TMeta>) {
  const { t } = useTranslation();
  const { showError } = useApp();
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { searchParams } = useFilterParams();

  const [total, setTotal] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);

  // Derive API filters from URL params based on config
  const apiFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    
    // Iterate over config to allow specific keys
    filterConfig.forEach((config) => {
        const key = config.filterKey;
        const value = searchParams.get(key);
        
        if (value !== null && value !== "") {
            filters[camelToSnake(key)] = value;
        }
    });

    return filters;
  }, [filterConfig, searchParams]);

  const apiFiltersString = JSON.stringify(apiFilters);

  // Sync URL filters to local state (for search inputs etc)
  useEffect(() => {
      if (onFilterAppliedFromUrl) {
           // Common pattern: "name" or "fullName" or "content" is the main search
          const searchKey = filterConfig.find(
              f => f.filterKey === "name" || f.filterKey === "fullName" || f.filterKey === "content"
          )?.filterKey;

          if (searchKey) {
             const val = searchParams.get(searchKey);
             if (val) onFilterAppliedFromUrl(val);
          }
      }
  }, [searchParams, filterConfig, onFilterAppliedFromUrl]);


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFunction(page, pageSize, apiFilters);
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
      setLoading(false);
      setHasInitialFetch(true);
    }
  }, [page, pageSize, apiFiltersString, fetchFunction, getTotalFromResult, showError, t]);

  // Initial fetch and on params change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    apiFilters,
    // Expose pagination state to consumers
    page,
    pageSize,
    total,
    setPage,
    setPageSize,
    setTotal, // Optional, but usually auto-set
    handlePageChange: setPage,
    handlePageSizeChange: setPageSize,
    loading,
    refresh: fetchData,
    hasInitialFetch,
    setHasInitialFetch,
  };
}
