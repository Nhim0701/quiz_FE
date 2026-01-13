/**
 * Admin Tests routes
 */
export const ROUTES = {
  TESTS: {
    INDEX: "/admin/tests",
    INFO: (testId?: string) => (testId ? `/admin/tests/${testId}` : `/:testId`),
    QUESTIONS: {
      INDEX: (testId?: string) =>
        testId ? `/admin/tests/${testId}/questions` : `/questions`,
      NEW: (testId?: string) =>
        testId ? `/admin/tests/${testId}/questions/new` : `/questions/new`,
      EDIT: (testId?: string, questionId?: string) =>
        testId && questionId
          ? `/admin/tests/${testId}/questions/${questionId}`
          : `/questions/:questionId`,
    },
  },
};

export const ENDPOINTS = {
  TESTS: {
    LIST: "/api/v1/tests",
    GET: (id: string) => `/api/v1/tests/${id}`,
    CREATE: "/api/v1/tests",
    UPDATE: (id: string) => `/api/v1/tests/${id}`,
    DELETE: (id: string) => `/api/v1/tests/${id}`,

    TEST_ID: ":testId",
    TEST_INFO: (testId?: string) =>
      testId ? `/admin/tests/${testId}` : `/admin/tests/:testId`,
  },

  // Questions routes
  QUESTIONS: {
    LIST: (testId: string) => `/api/v1/tests/${testId}/questions`,
    GET: (testId: string, questionId: string) =>
      `/api/v1/tests/${testId}/questions/${questionId}`,
    CREATE: (testId: string) => `/api/v1/tests/${testId}/questions`,
    UPDATE: (testId: string, questionId: string) =>
      `/api/v1/tests/${testId}/questions/${questionId}`,
    DELETE: (testId: string, questionId: string) =>
      `/api/v1/tests/${testId}/questions/${questionId}`,
  },
} as const;
