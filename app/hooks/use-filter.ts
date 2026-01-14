import { useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { SearchIcon, FunnelXIcon, DownloadIcon } from "lucide-react";
import {
  FILTER_ACTION_IDS,
  FILTER_ACTION_CLASSES,
  FILTER_QUERY_PARAMS,
} from "@/constants";
import type { FilterAction } from "@/components/common/filters";
import { camelToSnake } from "@/lib";

// ============================================================================
// Types
// ============================================================================

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
}

export interface FilterHandlerConfig {
  filterId: string;
  resetValue: () => void;
}

export type FilterColorKey =
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "primary"
  | "default";

export interface FilterIdsConfig {
  filterIds: string[];
  colorMap?: Partial<Record<string, FilterColorKey>>;
}

// ============================================================================
// useFilterActions
// ============================================================================

interface UseFilterActionsOptions {
  onSearch: () => void;
  activeFilters?: ActiveFilter[];
  onClearFilters?: () => void;
  showExport?: boolean;
  exportButtonId?:
    | typeof FILTER_ACTION_IDS.EXPORT
    | typeof FILTER_ACTION_IDS.DOWNLOAD;
  exportButtonClassName?: string;
  exportButtonOnClick?: () => void;
}

export const useFilterActions = ({
  onSearch,
  activeFilters = [],
  onClearFilters,
  showExport = false,
  exportButtonId = FILTER_ACTION_IDS.EXPORT,
  exportButtonClassName = FILTER_ACTION_CLASSES.EXPORT_DEFAULT,
  exportButtonOnClick,
}: UseFilterActionsOptions): FilterAction[] => {
  return useMemo(() => {
    const buttons: FilterAction[] = [
      {
        id: FILTER_ACTION_IDS.SEARCH,
        icon: SearchIcon,
        onClick: onSearch,
        className: FILTER_ACTION_CLASSES.SEARCH,
      },
    ];

    const hasActiveFilters = activeFilters.length > 0;
    if (hasActiveFilters && onClearFilters) {
      buttons.push({
        id: FILTER_ACTION_IDS.FILTER_CLEAR,
        icon: FunnelXIcon,
        onClick: onClearFilters,
        className: FILTER_ACTION_CLASSES.FILTER_CLEAR,
      });
    }

    if (showExport) {
      buttons.push({
        id: exportButtonId,
        icon: DownloadIcon,
        onClick: exportButtonOnClick,
        className: exportButtonClassName,
      });
    }

    return buttons;
  }, [
    onSearch,
    activeFilters.length,
    onClearFilters,
    showExport,
    exportButtonId,
    exportButtonClassName,
    exportButtonOnClick,
  ]);
};

// ============================================================================
// useFilterHandlers
// ============================================================================

interface UseFilterHandlersOptions {
  handlers: FilterHandlerConfig[];
  onFilterChange: () => void;
}

export const useFilterHandlers = ({
  handlers,
  onFilterChange,
}: UseFilterHandlersOptions) => {
  const handleRemoveFilter = useCallback(
    (filterId: string) => {
      const handler = handlers.find((h) => h.filterId === filterId);
      if (handler) {
        handler.resetValue();
        onFilterChange();
      }
    },
    [handlers, onFilterChange]
  );

  const handleClearAllFilters = useCallback(() => {
    handlers.forEach((handler) => {
      handler.resetValue();
    });
    onFilterChange();
  }, [handlers, onFilterChange]);

  return {
    handleRemoveFilter,
    handleClearAllFilters,
  };
};

// ============================================================================
// useFilterIdsConfig
// ============================================================================

interface UseFilterIdsConfigOptions {
  handlers: FilterHandlerConfig[];
  colorMap?: Partial<Record<string, FilterColorKey>>;
}

/**
 * Generate filterIds configuration from filter handlers
 * Allows modules to configure their filterIds and color mappings
 */
export const useFilterIdsConfig = ({
  handlers,
  colorMap,
}: UseFilterIdsConfigOptions): FilterIdsConfig => {
  return useMemo(
    () => ({
      filterIds: handlers.map((h) => h.filterId),
      colorMap,
    }),
    [handlers, colorMap]
  );
};

// ============================================================================
// useApplyFilterFromUrl
// ============================================================================

export type FilterHandler = (filterKey: string, filterValue: string) => void;

interface UseApplyFilterFromUrlOptions {
  filterHandlers: Record<string, FilterHandler>;
  onFilterApplied?: () => void;
}

/**
 * Helper to create a filter handler for enum values
 * Validates and sets enum value if valid
 */
export const createEnumFilterHandler = <T extends Record<string, string>>(
  enumObject: T,
  setter: (value: T[keyof T]) => void
): FilterHandler => {
  return (_, filterValue) => {
    if (Object.values(enumObject).includes(filterValue as T[keyof T])) {
      setter(filterValue as T[keyof T]);
    }
  };
};

/**
 * Helper to create a filter handler for string values
 */
export const createStringFilterHandler = (
  setter: (value: string) => void
): FilterHandler => {
  return (_, filterValue) => {
    setter(filterValue);
  };
};

/**
 * Helper to create a filter handler for date values
 */
export const createDateFilterHandler = (
  setter: (value: Date | null) => void
): FilterHandler => {
  return (_, filterValue) => {
    const date = new Date(filterValue);
    if (!isNaN(date.getTime())) {
      setter(date);
    }
  };
};

/**
 * Helper to create a filter handler for array values (comma-separated)
 */
export const createArrayFilterHandler = (
  setter: (value: string[]) => void
): FilterHandler => {
  return (_, filterValue) => {
    if (!filterValue?.trim()) {
      setter([]);
      return;
    }
    const array = filterValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setter(array);
  };
};

/**
 * Helper to create a filter handler for mapped values
 * Maps filter value to a different value using a mapping object
 */
export const createMappedFilterHandler = <T extends Record<string, any>>(
  mapping: T,
  setter: (value: T[keyof T]) => void,
  defaultValue?: T[keyof T]
): FilterHandler => {
  return (_, filterValue) => {
    const mappedValue = mapping[filterValue as keyof T] ?? defaultValue;
    if (mappedValue !== undefined) {
      setter(mappedValue);
    }
  };
};

/**
 * Helper to create a filter handler that validates enum then maps to a different value
 * First validates the filterValue is in the enum, then maps it to the target value
 */
export const createEnumMappedFilterHandler = <
  TEnum extends Record<string, string>,
  TMapping extends Record<string, any>,
>(
  enumObject: TEnum,
  mapping: TMapping,
  setter: (value: TMapping[keyof TMapping]) => void,
  defaultValue?: TMapping[keyof TMapping]
): FilterHandler => {
  return (_, filterValue) => {
    if (Object.values(enumObject).includes(filterValue as TEnum[keyof TEnum])) {
      const mappedValue =
        mapping[filterValue as keyof TMapping] ?? defaultValue;
      if (mappedValue !== undefined) {
        setter(mappedValue);
      }
    }
  };
};

// ============================================================================
// Filter Value Converters
// ============================================================================

/**
 * Create converter for enum values (exclude default/ALL value)
 */
export const createEnumConverter = <T extends Record<string, string>>(
  enumObject: T,
  defaultValue: T[keyof T]
): FilterValueConverter<T[keyof T]> => {
  return (val) => (val !== defaultValue ? val : null);
};

/**
 * Create converter for string values (exclude empty string)
 */
export const createStringConverter = (): FilterValueConverter<string> => {
  return (val) => val || null;
};

/**
 * Create converter for date values (format as YYYY-MM-DD)
 */
export const createDateConverter = (): FilterValueConverter<Date | null> => {
  return (val) => (val ? val.toISOString().split("T")[0] : null);
};

/**
 * Create converter for array values (exclude empty array)
 */
export const createArrayConverter = <T extends string[]>(
  defaultValue?: T
): FilterValueConverter<T> => {
  return (val) => (val.length > 0 ? val : null);
};

/**
 * Create converter for mapped values (find key from mapping)
 * Accepts mapping with different value types (union type)
 */
export const createMappedConverter = <TMapping extends Record<string, any>>(
  mapping: TMapping,
  defaultValue: TMapping[keyof TMapping]
): FilterValueConverter<TMapping[keyof TMapping]> => {
  return (val: TMapping[keyof TMapping]) => {
    const match = Object.entries(mapping).find(([_, def]) => def === val);
    return match && match[0] !== "ALL" ? match[0] : null;
  };
};

// ============================================================================
// FilterManager - Strategy Pattern for managing filters
// ============================================================================

interface FilterEntry {
  key: string;
  value: string;
}

/**
 * FilterManager object to handle serialization/deserialization of filters
 * Uses Strategy pattern for filter operations
 */
export const FilterManager = {
  /**
   * Extract all filters from URL search params with indexed format
   * Returns array of {key, value} pairs
   * Prioritizes indexed format (filter-key-1, filter-value-1, ...) over legacy format
   */
  extractFiltersFromUrl(searchParams: URLSearchParams): FilterEntry[] {
    const filters: FilterEntry[] = [];

    // Check if indexed format exists (filter-key-1, filter-value-1)
    const hasIndexedFormat = searchParams.has(
      FILTER_QUERY_PARAMS.FILTER_KEY(1)
    );

    if (hasIndexedFormat) {
      let index = 1;
      while (true) {
        const key = searchParams.get(FILTER_QUERY_PARAMS.FILTER_KEY(index));
        const value = searchParams.get(FILTER_QUERY_PARAMS.FILTER_VALUE(index));
        if (key && value) {
          filters.push({ key, value });
          index++;
        } else {
          break;
        }
      }
    } else {
      // Legacy format support
      const legacyKey = searchParams.get("key");
      const legacyValue = searchParams.get("value");
      if (legacyKey && legacyValue) {
        filters.push({ key: legacyKey, value: legacyValue });
      }
    }

    return filters;
  },

  /**
   * Serialize filters to URL search params with indexed format
   * Returns new URLSearchParams with all filters indexed from 1
   */
  serializeFiltersToUrl(
    searchParams: URLSearchParams,
    filters: FilterEntry[]
  ): URLSearchParams {
    const newParams = new URLSearchParams(searchParams);

    // Remove legacy format
    newParams.delete("key");
    newParams.delete("value");

    // Remove all indexed filter params
    let index = 1;
    while (true) {
      const key = FILTER_QUERY_PARAMS.FILTER_KEY(index);
      const value = FILTER_QUERY_PARAMS.FILTER_VALUE(index);
      if (newParams.has(key) || newParams.has(value)) {
        newParams.delete(key);
        newParams.delete(value);
        index++;
      } else {
        break;
      }
    }

    // Remove filter keys that will be added as indexed params
    const filterKeysToRemove = new Set(filters.map((f) => f.key));
    filterKeysToRemove.forEach((key) => newParams.delete(key));

    // Add all active filters with indexed format
    filters.forEach((filter, idx) => {
      const filterIndex = idx + 1;
      newParams.set(FILTER_QUERY_PARAMS.FILTER_KEY(filterIndex), filter.key);
      newParams.set(
        FILTER_QUERY_PARAMS.FILTER_VALUE(filterIndex),
        filter.value
      );
    });

    return newParams;
  },

  /**
   * Convert filter entries to API params format with filter-key-N and filter-value-N
   * Converts filter keys from camelCase to snake_case for backend
   * Example: [{key: "name", value: "C02"}, {key: "categoryId", value: "1,2"}]
   * -> {filter-key-1: "name", filter-value-1: "C02", filter-key-2: "category_id", filter-value-2: "1,2"}
   */
  convertFiltersToApiParams(filters: FilterEntry[]): Record<string, string> {
    const apiParams: Record<string, string> = {};

    filters.forEach((filter, index) => {
      const filterIndex = index + 1;
      const keyParam = FILTER_QUERY_PARAMS.FILTER_KEY(filterIndex);
      const valueParam = FILTER_QUERY_PARAMS.FILTER_VALUE(filterIndex);

      // Convert filter key from camelCase to snake_case
      const snakeCaseKey = camelToSnake(filter.key);
      apiParams[keyParam] = snakeCaseKey;
      apiParams[valueParam] = filter.value;
    });

    return apiParams;
  },
};

// Shared ref to track if we're applying filters from URL (to prevent sync loop)
const isApplyingFromUrlRef = new Map<string, { current: boolean }>();

/**
 * Helper to get or create ref for a hook instance
 * Prevents duplicate ref initialization code
 */
const getOrCreateRef = (hookId: string): { current: boolean } => {
  if (!isApplyingFromUrlRef.has(hookId)) {
    isApplyingFromUrlRef.set(hookId, { current: false });
  }
  return isApplyingFromUrlRef.get(hookId)!;
};

/**
 * Hook to apply filter from URL query parameters
 * Automatically reads all filter-key-N and filter-value-N from URL and applies the appropriate filters
 * @param filterHandlers - Object mapping filter keys to handler functions
 * @param onFilterApplied - Optional callback to call after filter is applied (e.g., fetch data)
 * @param hookId - Unique identifier for this hook instance (to share ref state)
 */
export const useApplyFilterFromUrl = ({
  filterHandlers,
  onFilterApplied,
  hookId = "default",
}: UseApplyFilterFromUrlOptions & { hookId?: string }): {
  hasFilterParams: boolean;
} => {
  const [searchParams] = useSearchParams();
  const ref = useMemo(() => getOrCreateRef(hookId), [hookId]);

  const searchParamsString = searchParams.toString();
  const filters = useMemo(
    () => FilterManager.extractFiltersFromUrl(searchParams),
    [searchParams, searchParamsString]
  );

  const prevFiltersRef = useRef<string>("");
  const isInitialMount = useRef(true);

  useEffect(() => {
    const filtersKey = JSON.stringify(filters);
    const shouldApply =
      filters.length > 0 &&
      (isInitialMount.current || filtersKey !== prevFiltersRef.current);

    if (shouldApply) {
      isInitialMount.current = false;
      prevFiltersRef.current = filtersKey;
      ref.current = true;

      let hasApplied = false;
      filters.forEach(({ key, value }) => {
        const handler = filterHandlers[key];
        if (handler) {
          handler(key, value);
          hasApplied = true;
        }
      });

      if (hasApplied && onFilterApplied) {
        requestAnimationFrame(() => {
          onFilterApplied();
          setTimeout(() => {
            ref.current = false;
          }, 100);
        });
      } else {
        setTimeout(() => {
          ref.current = false;
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchParamsString]);

  return { hasFilterParams: filters.length > 0 };
};

// ============================================================================
// useSyncFilterToUrl
// ============================================================================

export type FilterValueConverter<T> = (value: T) => string | string[] | null;

interface FilterSyncConfig<T> {
  filterKey: string;
  value: T;
  converter: FilterValueConverter<T>;
  defaultValue?: T;
}

interface UseSyncFilterToUrlOptions {
  filters: FilterSyncConfig<any>[];
  enabled?: boolean;
}

/**
 * Hook to sync filter state to URL query parameters
 * Updates URL when filters change (but not when applying from URL to avoid loops)
 * Supports multiple filters with indexed format (filter-key-1, filter-value-1, ...)
 * @param filters - Array of filter configurations to sync
 * @param enabled - Whether to enable URL syncing (default: true)
 * @param hookId - Unique identifier matching the useApplyFilterFromUrl hookId
 */
export const useSyncFilterToUrl = ({
  filters,
  enabled = true,
  hookId = "default",
}: UseSyncFilterToUrlOptions & { hookId?: string }): void => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);
  const ref = useMemo(() => getOrCreateRef(hookId), [hookId]);

  useEffect(
    () => {
      if (!enabled || isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      // Skip if we're currently applying filters from URL
      if (ref.current) {
        return;
      }

      // Collect all active filters (non-default values)
      const activeFilters: FilterEntry[] = [];

      filters.forEach((filter) => {
        const converted = filter.converter(filter.value);
        if (converted === null) return;

        const isActive = Array.isArray(converted)
          ? converted.length > 0
          : filter.defaultValue !== undefined
            ? converted !== filter.converter(filter.defaultValue)
            : converted !== "";

        if (isActive) {
          activeFilters.push({
            key: filter.filterKey,
            value: Array.isArray(converted) ? converted.join(",") : converted,
          });
        }
      });

      const newSearchParams = FilterManager.serializeFiltersToUrl(
        searchParams,
        activeFilters
      );

      // Compare filters (order-independent)
      const currentFilters = FilterManager.extractFiltersFromUrl(searchParams);
      const createFilterMap = (entries: FilterEntry[]) =>
        new Map(entries.map((f) => [f.key, f.value]));

      const activeMap = createFilterMap(activeFilters);
      const currentMap = createFilterMap(currentFilters);

      const filtersChanged =
        activeMap.size !== currentMap.size ||
        Array.from(activeMap.entries()).some(
          ([key, value]) => currentMap.get(key) !== value
        );

      // Only update if filters actually changed
      if (filtersChanged) {
        navigate(
          { search: newSearchParams.toString() },
          { replace: true, preventScrollReset: true }
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    filters.map((f) => f.value)
  );
};
