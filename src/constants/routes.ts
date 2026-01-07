// Application Routes
export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  DASHBOARD: "/dashboard",
  TESTS: "/tests",
  TEST: "/test",
  RESULT: "/result",
} as const;

// Default redirect routes
export const DEFAULT_ROUTES = {
  AUTHENTICATED: ROUTES.DASHBOARD,
  UNAUTHENTICATED: ROUTES.LOGIN,
} as const;

