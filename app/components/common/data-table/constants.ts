/**
 * Action Button CSS Classes
 * Base classes for action buttons in DataTable
 */
export const ACTION_BUTTON_BASE_CLASSES =
  "h-8 w-8 p-0 transition-all duration-200 shadow-sm hover:shadow-md";

/**
 * Action Type CSS Classes
 * Maps actionType to their corresponding CSS classes
 */
export const ACTION_TYPE_CLASSES = {
  delete:
    "border-destructive/50 text-destructive hover:bg-gradient-to-br hover:from-red-500 hover:to-red-700 hover:text-white hover:border-red-600 dark:border-destructive/90 dark:text-destructive dark:hover:from-red-600 dark:hover:to-red-700 dark:hover:border-red-500",
  edit: "border-emerald-500/50 text-emerald-600 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-green-600 hover:text-white hover:border-emerald-600 dark:border-emerald-400/50 dark:text-emerald-400 dark:hover:from-emerald-600 dark:hover:to-green-700 dark:hover:border-emerald-500",
  viewInfo:
    "border-blue-500/50 text-blue-600 hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-blue-600 dark:border-blue-400/50 dark:text-blue-400 dark:hover:from-blue-600 dark:hover:to-indigo-700 dark:hover:border-blue-500",
  default:
    "border-blue-500/50 text-blue-600 hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-blue-600 dark:border-blue-400/50 dark:text-blue-400 dark:hover:from-blue-600 dark:hover:to-indigo-700 dark:hover:border-blue-500",
} as const;
