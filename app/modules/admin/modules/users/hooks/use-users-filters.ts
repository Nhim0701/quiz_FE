import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "@/i18n";
import {
  usePaginationStore,
  useApp,
  createStringConverter,
  createArrayConverter,
  createStringFilterHandler,
  createArrayFilterHandler,
  useSyncFilterToUrl,
  useApplyFilterFromUrl,
  FilterManager,
} from "@/hooks";
import { useUsersStore } from "./use-users";

const HOOK_ID = "users";

export function useUsersFilters(
  onClearFiltersReady?: (clearFilters: () => void) => void
) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { showError } = useApp();
  const { pageSize, setPage, setTotal } = usePaginationStore();
  const { fetchUsers } = useUsersStore();

  // Search input state (for typing)
  const [searchInput, setSearchInput] = useState("");
  // Search value state (for filtering - only updates on Enter/button click)
  const [searchValue, setSearchValue] = useState("");
  // Role filter state
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Track if filters are being applied from URL to skip initial fetch
  const isApplyingFiltersFromUrl = useRef(false);
  const hasInitialFetch = useRef(false);

  const filterConfig = useMemo(
    () => [
      {
        filterKey: "fullName",
        value: searchValue,
        defaultValue: "",
        converter: createStringConverter(),
      },
      {
        filterKey: "roleId",
        value: selectedRoleIds,
        defaultValue: [],
        converter: createArrayConverter([]),
      },
    ],
    [searchValue, selectedRoleIds]
  );

  const { hasFilterParams } = useApplyFilterFromUrl({
    filterHandlers: {
      fullName: createStringFilterHandler(setSearchValue),
      roleId: createArrayFilterHandler(setSelectedRoleIds),
    },
    onFilterApplied: async () => {
      isApplyingFiltersFromUrl.current = true;
      hasInitialFetch.current = true;
      setPage(1);

      // Also set search input from URL
      const urlFilters = FilterManager.extractFiltersFromUrl(searchParams);
      const nameFilter = urlFilters.find((f) => f.key === "fullName");
      if (nameFilter) {
        setSearchInput(nameFilter.value);
      }

      try {
        const apiFilters = FilterManager.convertFiltersToApiParams(urlFilters);
        const result = await fetchUsers(1, pageSize, apiFilters);
        const totalCount = result?.meta?.total ?? result?.data?.length ?? 0;
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
    hookId: HOOK_ID,
  });

  useSyncFilterToUrl({
    filters: filterConfig,
    hookId: HOOK_ID,
  });

  const handleSearch = useCallback(() => {
    setSearchValue(searchInput);
    setPage(1);
  }, [searchInput, setPage]);

  const apiFilters = useMemo(() => {
    const activeFilters: Array<{ key: string; value: string }> = [];
    filterConfig.forEach((filter: any) => {
      const converted = filter.converter(filter.value);
      if (converted === null) return;

      let isActive = false;
      if (Array.isArray(converted)) {
        isActive = converted.length > 0;
      } else if (filter.defaultValue !== undefined) {
        const defaultConverted = filter.converter(filter.defaultValue);
        isActive = converted !== defaultConverted;
      } else {
        isActive = converted !== "";
      }

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

  return {
    searchInput,
    setSearchInput,
    searchValue,
    setSearchValue,
    selectedRoleIds,
    setSelectedRoleIds,
    handleSearch,
    apiFilters,
    hasFilterParams,
    isApplyingFiltersFromUrl,
    hasInitialFetch,
  };
}
