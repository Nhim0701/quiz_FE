// Filter Action IDs
export const FILTER_ACTION_IDS = {
  SEARCH: "search",
  FILTER_CLEAR: "filter-clear",
  EXPORT: "export",
  DOWNLOAD: "download",
} as const;

// Filter Action CSS Classes
export const FILTER_ACTION_CLASSES = {
  SEARCH:
    "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-600 dark:text-blue-400 dark:bg-blue-900/10",
  FILTER_CLEAR:
    "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 hover:text-destructive dark:text-destructive dark:bg-destructive/10",
  EXPORT_DEFAULT:
    "hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 dark:bg-green-900/10 dark:text-green-400",
  DOWNLOAD_DEFAULT:
    "hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 dark:bg-indigo-900/10 dark:text-indigo-400",
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
    "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400 dark:hover:bg-green-600/20",
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
