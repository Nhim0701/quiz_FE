// Filter Action IDs
export const FILTER_ACTION_IDS = {
  SEARCH: "search",
  FILTER_CLEAR: "filter-clear",
  EXPORT: "export",
  DOWNLOAD: "download",
} as const;

// Filter Action CSS Classes
export const FILTER_ACTION_CLASSES = {
  SEARCH: "hover:bg-primary/10 hover:text-primary",
  FILTER_CLEAR: "hover:bg-destructive/10 hover:text-destructive",
  EXPORT_DEFAULT:
    "hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400",
  DOWNLOAD_DEFAULT:
    "hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
} as const;

// Filter Query Parameters
// Always use indexed format (filter-key-1, filter-value-1, ...)
export const FILTER_QUERY_PARAMS = {
  FILTER_KEY: (index: number) => `filter-key-${index}`,
  FILTER_VALUE: (index: number) => `filter-value-${index}`,
} as const;

// Filter Patterns for color matching
export const FILTER_PATTERNS = {
  SEARCH: "search",
  DATE: "date",
  TIME: "time",
  FROM: "from",
  TO: "to",
} as const;

// Filter Color Palette
export const FILTER_COLOR_PALETTE = {
  primary: "bg-primary/10 text-primary border-primary/20",
  blue: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  green:
    "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
  yellow:
    "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
  purple:
    "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
  default: "bg-muted text-muted-foreground border-border",
} as const;

// Keyboard Keys
export const KEYBOARD_KEYS = {
  ENTER: "Enter",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
} as const;
