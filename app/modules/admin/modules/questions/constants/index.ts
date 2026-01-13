/**
 * Admin Questions routes
 */
export const ROUTES = {
  QUESTIONS: {
    INDEX: (testId?: string) =>
      testId ? `/admin/tests/${testId}/questions` : `/admin/questions`,
    NEW: (testId?: string) =>
      testId ? `/admin/tests/${testId}/questions/new` : `/admin/questions/new`,
    EDIT: (testId?: string, questionId?: string) =>
      testId && questionId
        ? `/admin/tests/${testId}/questions/${questionId}`
        : `/admin/questions/:questionId`,
  },
} as const;

export const ENDPOINTS = {
  QUESTIONS: {
    LIST: (testId: string) => `/api/v1/tests/${testId}/questions`,
    GET: (questionId: string) => `/api/v1/questions/${questionId}`,
    CREATE: "/api/v1/questions",
    UPDATE: (questionId: string) => `/api/v1/questions/${questionId}`,
    DELETE: (questionId: string) => `/api/v1/questions/${questionId}`,
  },
} as const;
