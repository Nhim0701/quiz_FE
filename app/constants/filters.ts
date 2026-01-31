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
    "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-500/20 hover:from-blue-500/20 hover:to-indigo-500/20 hover:text-blue-600 dark:text-blue-400 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 shadow-sm hover:shadow-md transition-all duration-200",
  FILTER_CLEAR:
    "bg-gradient-to-r from-red-500/10 to-rose-500/10 text-destructive border-destructive/20 hover:from-red-500/20 hover:to-rose-500/20 hover:text-destructive dark:text-destructive dark:from-red-900/20 dark:to-rose-900/20 dark:hover:from-red-800/30 dark:hover:to-rose-800/30 shadow-sm hover:shadow-md transition-all duration-200",
  EXPORT_DEFAULT:
    "bg-gradient-to-r from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 dark:from-emerald-900/20 dark:to-green-900/20 dark:hover:from-emerald-800/30 dark:hover:to-green-800/30 shadow-sm hover:shadow-md transition-all duration-200",
  DOWNLOAD_DEFAULT:
    "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 dark:from-indigo-900/20 dark:to-purple-900/20 dark:hover:from-indigo-800/30 dark:hover:to-purple-800/30 shadow-sm hover:shadow-md transition-all duration-200",
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
  primary:
    "bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/20 hover:from-primary/15 hover:to-primary/25 dark:from-primary/20 dark:to-primary/30 dark:hover:from-primary/25 dark:hover:to-primary/35 shadow-sm transition-all duration-200",
  blue: "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-500/20 hover:from-blue-500/15 hover:to-indigo-500/15 dark:text-blue-400 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:from-blue-800/25 dark:hover:to-indigo-800/25 shadow-sm transition-all duration-200",
  green:
    "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 border-emerald-500/20 hover:from-emerald-500/15 hover:to-green-500/15 dark:text-emerald-400 dark:from-emerald-900/20 dark:to-green-900/20 dark:hover:from-emerald-800/25 dark:hover:to-green-800/25 shadow-sm transition-all duration-200",
  yellow:
    "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-yellow-600 border-yellow-500/20 hover:from-yellow-500/15 hover:to-amber-500/15 dark:text-yellow-400 dark:from-yellow-900/20 dark:to-amber-900/20 dark:hover:from-yellow-800/25 dark:hover:to-amber-800/25 shadow-sm transition-all duration-200",
  purple:
    "bg-gradient-to-r from-purple-500/10 to-violet-500/10 text-purple-600 border-purple-500/20 hover:from-purple-500/15 hover:to-violet-500/15 dark:text-purple-400 dark:from-purple-900/20 dark:to-violet-900/20 dark:hover:from-purple-800/25 dark:hover:to-violet-800/25 shadow-sm transition-all duration-200",
  default:
    "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-slate-300 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 dark:border-slate-600 shadow-sm transition-all duration-200",
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
