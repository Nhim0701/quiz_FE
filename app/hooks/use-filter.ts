import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router";
import { SearchIcon, FunnelXIcon, DownloadIcon } from "lucide-react";
import {
  FILTER_ACTION_IDS,
  FILTER_ACTION_CLASSES,
} from "@/constants";
import type { FilterAction } from "@/components/common/filters";

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
  onFilterChange?: () => void;
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
        if (onFilterChange) onFilterChange();
      }
    },
    [handlers, onFilterChange]
  );

  const handleClearAllFilters = useCallback(() => {
    handlers.forEach((handler) => {
      handler.resetValue();
    });
    if (onFilterChange) onFilterChange();
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
// useFilterParams - New simplified hook
// ============================================================================

export const useFilterParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getFilter = useCallback(
    (key: string) => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      setSearchParams(
        (prev) => {
          if (value === null || value === "") {
            prev.delete(key);
          } else {
            prev.set(key, value);
          }
          // Reset page when filter changes
          if (prev.has("page")) {
            prev.set("page", "1");
          }
          return prev;
        },
        { preventScrollReset: true }
      );
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(
    (keysToKeep: string[] = ["pageSize"]) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams();
          keysToKeep.forEach((key) => {
            if (prev.has(key)) {
              newParams.set(key, prev.get(key)!);
            }
          });
          return newParams;
        },
        { preventScrollReset: true }
      );
    },
    [setSearchParams]
  );

  return {
    searchParams,
    getFilter,
    setFilter,
    clearFilters,
  };
};

// ============================================================================
// Filter Helpers (Legacy/Migration helpers)
// ============================================================================



// Converters

export const createEnumConverter = <T extends Record<string, string>>(
  enumObject: T,
  defaultValue: T[keyof T]
): FilterValueConverter<T[keyof T]> => {
  return (val) => (val !== defaultValue ? val : null);
};

export const createDateConverter = (): FilterValueConverter<Date | null> => {
  return (val) => (val ? val.toISOString().split("T")[0] : null);
};

export const createArrayConverter = <T extends string[]>(
  defaultValue?: T
): FilterValueConverter<T> => {
  return (val) => (val.length > 0 ? val : null);
};

export const createMappedConverter = <TMapping extends Record<string, any>>(
  mapping: TMapping,
  defaultValue: TMapping[keyof TMapping]
): FilterValueConverter<TMapping[keyof TMapping]> => {
  return (val: TMapping[keyof TMapping]) => {
    const match = Object.entries(mapping).find(([_, def]) => def === val);
    return match && match[0] !== "ALL" ? match[0] : null;
  };
};

export type FilterValueConverter<T> = (value: T) => string | string[] | null;

export const createStringConverter = (): FilterValueConverter<string> => {
  return (val) => val || null;
};
