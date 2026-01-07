// Application Routes
export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  DASHBOARD: "/",
  TESTS: "/tests",
  TEST: "/test",
  RESULT: "/result",
} as const;

// Helper functions for dynamic test routes
export const createTestId = (category: string, questionSet?: string): string => {
  const data = questionSet ? `${category}:${questionSet}` : category;
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

export const decodeTestId = (testId: string): { category: string; questionSet?: string } => {
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

export const getTestRoute = (category: string, questionSet?: string): string => {
  const testId = createTestId(category, questionSet);
  return `/tests/${testId}`;
};

export const getTestResultRoute = (category: string, questionSet?: string): string => {
  const testId = createTestId(category, questionSet);
  return `/tests/${testId}/result`;
};

// Default redirect routes
export const DEFAULT_ROUTES = {
  AUTHENTICATED: ROUTES.DASHBOARD,
  UNAUTHENTICATED: ROUTES.LOGIN,
} as const;

