// Application Routes
export const ROUTES = {
  ROOT: "/",
  HOME: "/",

  //Admin routes
  ADMIN: {
    INDEX: "/admin",
    CATEGORIES: "/admin/categories",
    TESTS: "/admin/tests",
    TEST_ID: ":testId",
    TEST_INFO: (testId?: string) =>
      testId ? `/admin/tests/${testId}` : `/admin/tests/:testId`,
  },

  //Tests routes
  TESTS: {
    TEST_ID: ":testId",
    INDEX: "/tests",
    TAKE: (testId?: string) => (testId ? `/tests/${testId}/take` : `/take`),
    RESULT: (testId?: string) =>
      testId ? `/tests/${testId}/result` : `/result`,
  },
} as const;
