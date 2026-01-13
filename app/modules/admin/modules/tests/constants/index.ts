/**
 * Admin Tests routes
 */
export const ROUTES = {
  TESTS: {
    INDEX: "/admin/tests",
    INFO: (testId?: string) => (testId ? `/admin/tests/${testId}` : `/:testId`),
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
} as const;
