/**
 * Tests-specific API endpoints
 */
export const ENDPOINTS = {
  LIST: "/api/v1/tests",
  GET: (testId: string) => `/api/v1/tests/${testId}`,
  QUESTIONS: (testId: string) => `/api/v1/tests/${testId}/questions`,
  QUESTION: (testId: string, questionId: string) =>
    `/api/v1/tests/${testId}/questions/${questionId}`,
  SUBMIT: (testId: string) => `/api/v1/tests/${testId}/submit`,
} as const;

/**
 * Tests routes
 */
export const ROUTES = {
  INDEX: "/tests",
  TEST_ID: ":testId",
  TAKE: (testId?: string) => (testId ? `/tests/${testId}/take` : `/take`),
  RESULT: (testId?: string) => (testId ? `/tests/${testId}/result` : `/result`),
} as const;

/**
 * Time constants for tests
 */
export const TIME_CONSTANTS = {
  TIMER_INTERVAL: 1000, // 1 second
} as const;
