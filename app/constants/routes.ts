// Application Routes
export const ROUTES = {
  ROOT: "/",
  //Auth routes
  LOGIN: "/login",
  REGISTER: "/register",

  //Profile routes
  PROFILE: "/profile",
  DASHBOARD: "/dashboard",

  //Tests routes
  TESTS: {
    TEST_ID: ":testId",
    INDEX: "/tests",
    TAKE: (testId?: string) => (testId ? `/tests/${testId}/take` : `/take`),
    RESULT: (testId?: string) =>
      testId ? `/tests/${testId}/result` : `/result`,
  },
} as const;

// Default redirect routes
export const DEFAULT_ROUTES = {
  AUTHENTICATED: ROUTES.DASHBOARD,
  UNAUTHENTICATED: ROUTES.LOGIN,
} as const;
