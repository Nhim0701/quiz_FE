// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    REFRESH: "/api/v1/auth/token/refresh",
    REVOKE: "/api/v1/auth/token/revoke",
    ME: "/api/v1/users/me",
  },

  // Question endpoints
  QUESTIONS: {
    BY_CATEGORY: (category: string) => `/api/v1/questions/by-category/${category}`,
    BY_CATEGORY_AND_SET: (category: string, questionSet: string) =>
      `/api/v1/questions/by-category/${category}/set/${questionSet}`,
  },

  // Category endpoints
  CATEGORIES: {
    LIST: "/api/v1/categories/",
    QUESTION_SETS: (categoryId: string | number) =>
      `/api/v1/categories/${categoryId}/question-sets`,
  },

  // Response endpoints
  RESPONSES: {
    DASHBOARD: "/api/v1/submissions/dashboard",
    SUBMIT_BULK: "/api/v1/submissions/submit-bulk",
  },
} as const;

// API Configuration
export const API_CONFIG = {
  CONTENT_TYPE: "application/json",
  AUTHORIZATION_PREFIX: "Bearer",
} as const;

