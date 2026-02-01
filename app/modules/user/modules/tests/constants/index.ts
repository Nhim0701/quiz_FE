/**
 * Tests-specific API endpoints
 */
export const ENDPOINTS = {
  LIST: "/api/v1/tests",
  GET: (testId: string) => `/api/v1/tests/${testId}`,
  QUESTIONS: "/api/v1/questions",
  SUBMIT: (testId: string) => `/api/v1/tests/${testId}/submit`,
  SUBMISSION_GET: (testId: string, submissionId: string) =>
    `/api/v1/tests/${testId}/submit/${submissionId}`,
} as const;

/**
 * Tests routes
 */
export const ROUTES = {
  INDEX: "/tests",
  TEST_ID: ":testId",
  TAKE: (testId?: string) => (testId ? `/tests/${testId}/take` : `/take`),
  RESULT: (testId?: string) => (testId ? `/tests/${testId}/result` : `/result`),
  RESULT_BY_SUBMISSION: (testId?: string, submissionId?: string) =>
    (testId && submissionId ? `/tests/${testId}/result/${submissionId}` : `/result/:submissionId`),
} as const;

/**
 * Time constants for tests
 */
export const TIME_CONSTANTS = {
  TIMER_INTERVAL: 1000, // 1 second
} as const;

/**
 * Upload file constants
 */
export const UPLOAD_FILE_CONSTANTS = {
  PREFIX: import.meta.env.VITE_QUESTION_ASSET_PREFIX || "questions/uploads",
  EXPIRES_IN: import.meta.env.VITE_QUESTION_ASSET_EXPIRES_IN || 3600, // 1 hour
} as const;

const FILTER_STYLES = {
  all: {
    activeClass:
      "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white border-0 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-sm text-white hover:text-white",
    outlineClass:
      "border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
  },
  green: {
    activeClass:
      "bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 shadow-sm text-white hover:text-white",
    outlineClass:
      "border border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40",
  },
  slate: {
    activeClass:
      "bg-gradient-to-r from-slate-500 to-slate-600 dark:from-slate-500 dark:to-slate-500 text-white border-0 hover:from-slate-600 hover:to-slate-700 dark:hover:from-slate-600 dark:hover:to-slate-600 shadow-sm text-white hover:text-white",
    outlineClass:
      "border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
  },
  amber: {
    activeClass:
      "bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-amber-500 dark:to-yellow-500 text-white border-0 hover:from-amber-600 hover:to-yellow-700 dark:hover:from-amber-600 dark:hover:to-yellow-600 shadow-sm text-white hover:text-white",
    outlineClass:
      "border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40",
  },
  red: {
    activeClass:
      "bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-500 dark:to-rose-500 text-white border-0 hover:from-red-600 hover:to-rose-700 dark:hover:from-red-600 dark:hover:to-rose-600 shadow-sm text-white hover:text-white",
    outlineClass:
      "border border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40",
  },
} as const;

export type TestFilterType = "all" | "answered" | "not_answered" | "flagged";

export const TEST_FILTERS = {
  ALL: "all",
  ANSWERED: "answered",
  NOT_ANSWERED: "not_answered",
  FLAGGED: "flagged",
} as const satisfies Record<string, TestFilterType>;

export const TEST_FILTER_CONFIG: Record<
  TestFilterType,
  {
    labelKey: string;
    icon: "LayoutGrid" | "CheckCircle" | "HelpCircle" | "Flag";
    activeClass: string;
    outlineClass: string;
  }
> = {
  all: { labelKey: "test.filters.all", icon: "LayoutGrid", ...FILTER_STYLES.all },
  answered: { labelKey: "test.filters.answered", icon: "CheckCircle", ...FILTER_STYLES.green },
  not_answered: { labelKey: "test.filters.notAnswered", icon: "HelpCircle", ...FILTER_STYLES.slate },
  flagged: { labelKey: "test.filters.flagged", icon: "Flag", ...FILTER_STYLES.amber },
};

export type ResultFilterType =
  | "all"
  | "flagged"
  | "correct"
  | "incorrect"
  | "not_answered";

export type ResultQuestionStatus = "correct" | "incorrect" | "not_answered";

export const RESULT_QUESTION_STATUS = {
  CORRECT: "correct",
  INCORRECT: "incorrect",
  NOT_ANSWERED: "not_answered",
} as const satisfies Record<string, ResultQuestionStatus>;

export const RESULT_FILTERS = {
  ALL: "all",
  FLAGGED: "flagged",
  CORRECT: "correct",
  INCORRECT: "incorrect",
  NOT_ANSWERED: "not_answered",
} as const satisfies Record<string, ResultFilterType>;

export const RESULT_FILTER_CONFIG: Record<
  ResultFilterType,
  {
    labelKey: string;
    icon: "LayoutGrid" | "Flag" | "CheckCircle" | "XCircle" | "HelpCircle";
    activeClass: string;
    outlineClass: string;
  }
> = {
  all: { labelKey: "result.filters.all", icon: "LayoutGrid", ...FILTER_STYLES.all },
  flagged: { labelKey: "result.filters.flagged", icon: "Flag", ...FILTER_STYLES.amber },
  correct: { labelKey: "result.filters.correct", icon: "CheckCircle", ...FILTER_STYLES.green },
  incorrect: { labelKey: "result.filters.incorrect", icon: "XCircle", ...FILTER_STYLES.red },
  not_answered: { labelKey: "result.filters.notAnswered", icon: "HelpCircle", ...FILTER_STYLES.slate },
};
