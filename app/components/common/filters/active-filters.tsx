import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  ActiveFilter,
  FilterIdsConfig,
  FilterColorKey,
} from "@/hooks/useFilter";
import { FILTER_PATTERNS, FILTER_COLOR_PALETTE } from "@/constants/filters";

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onRemove: (filterId: string) => void;
  filterIdsConfig?: FilterIdsConfig;
  filterColorMap?: Record<string, string>; // Deprecated: use filterIdsConfig.colorMap instead
}

/**
 * Get color classes for a filter based on its ID using pattern matching
 * This is a fallback when filterIdsConfig is not provided.
 * Modules should configure their filter colors via filterIdsConfig.colorMap.
 */
const getFilterColorByPattern = (filterId: string): string => {
  const lowerId = filterId.toLowerCase();

  // Search filter - always use primary color
  if (
    lowerId === FILTER_PATTERNS.SEARCH ||
    lowerId.includes(FILTER_PATTERNS.SEARCH)
  ) {
    return FILTER_COLOR_PALETTE.primary;
  }

  // Date-related filters - use purple
  if (
    lowerId.includes(FILTER_PATTERNS.DATE) ||
    lowerId.includes(FILTER_PATTERNS.TIME) ||
    lowerId.startsWith(FILTER_PATTERNS.FROM) ||
    lowerId.startsWith(FILTER_PATTERNS.TO)
  ) {
    return FILTER_COLOR_PALETTE.purple;
  }

  // Default fallback
  return FILTER_COLOR_PALETTE.default;
};

/**
 * Get color classes for a filter based on configuration priority
 */
const getFilterColorClasses = (
  filterId: string,
  filterIdsConfig?: FilterIdsConfig,
  filterColorMap?: Record<string, string>
): string => {
  // Priority 1: Use filterIdsConfig.colorMap if provided
  if (filterIdsConfig?.colorMap?.[filterId]) {
    const colorKey = filterIdsConfig.colorMap[filterId];
    return FILTER_COLOR_PALETTE[colorKey] || FILTER_COLOR_PALETTE.default;
  }

  // Priority 1.5: Check if this is a dynamic filter ID (e.g., EVENT_eventId)
  // Try to match the base filter ID pattern
  if (filterIdsConfig?.colorMap) {
    for (const [baseFilterId, colorKey] of Object.entries(
      filterIdsConfig.colorMap
    )) {
      if (filterId.startsWith(`${baseFilterId}_`)) {
        return (
          FILTER_COLOR_PALETTE[colorKey as keyof typeof FILTER_COLOR_PALETTE] ||
          FILTER_COLOR_PALETTE.default
        );
      }
    }
  }

  // Priority 2: Use deprecated filterColorMap for backward compatibility
  if (filterColorMap?.[filterId]) {
    return filterColorMap[filterId];
  }

  // Priority 3: Use pattern-based matching
  return getFilterColorByPattern(filterId);
};

export const ActiveFilters = ({
  filters,
  onRemove,
  filterIdsConfig,
  filterColorMap, // Deprecated: kept for backward compatibility
}: ActiveFiltersProps): React.ReactElement | null => {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors",
            getFilterColorClasses(filter.id, filterIdsConfig, filterColorMap)
          )}
        >
          <span className="font-medium">{filter.label}:</span>
          <span className="opacity-80">{filter.value}</span>
          <button
            type="button"
            onClick={() => onRemove(filter.id)}
            className="ml-0.5 rounded-full hover:bg-destructive/10 dark:hover:bg-destructive/20 p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            aria-label={`Remove ${filter.label} filter`}
          >
            <XIcon className="size-3.5 opacity-70 hover:opacity-100 hover:text-destructive transition-colors" />
          </button>
        </Badge>
      ))}
    </div>
  );
};
