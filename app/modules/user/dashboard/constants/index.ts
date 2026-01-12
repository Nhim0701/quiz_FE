/**
 * Dashboard-specific API endpoints
 */
export const DASHBOARD_API_ENDPOINTS = {
  DASHBOARD: "/api/v1/me/dashboard",
} as const;

export const ROUTES = {
  DASHBOARD: "/dashboard",
} as const;

/**
 * Color classes for stats icons
 */
export const STATS_COLOR_CLASSES = {
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
} as const;

/**
 * Color classes for stats values
 */
export const STATS_VALUE_COLOR_CLASSES = {
  blue: "text-slate-800 dark:text-slate-100",
  green: "text-green-600 dark:text-green-400",
  red: "text-red-600 dark:text-red-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
} as const;

/**
 * Stats color type
 */
export type StatsColor = keyof typeof STATS_COLOR_CLASSES;
