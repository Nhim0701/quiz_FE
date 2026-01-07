// Application Routes
export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  TEST: "/test",
  RESULT: "/result",
} as const;

// Default redirect routes
export const DEFAULT_ROUTES = {
  AUTHENTICATED: ROUTES.PROFILE,
  UNAUTHENTICATED: ROUTES.LOGIN,
} as const;

