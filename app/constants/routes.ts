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

export const decodeTestId = (
  testId: string
): { category: string; questionSet?: string } => {
  try {
    const decoded = atob(testId.replace(/-/g, "+").replace(/_/g, "/"));
    const parts = decoded.split(":");
    const category = parts[0] || "";
    const questionSet = parts[1];
    return { category, questionSet };
  } catch {
    throw new Error("Invalid test ID");
  }
};

export const getTestResultRoute = (questionSetId: string): string => {
  return `/tests/${questionSetId}/result`;
};

// Default redirect routes
export const DEFAULT_ROUTES = {
  AUTHENTICATED: ROUTES.DASHBOARD,
  UNAUTHENTICATED: ROUTES.LOGIN,
} as const;
