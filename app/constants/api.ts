export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    REFRESH: "/api/v1/auth/token/refresh",
    REVOKE: "/api/v1/auth/token/revoke",
  },

  // Me endpoints
  ME: {
    GET: "/api/v1/me",
    UPDATE: "/api/v1/me",
    CHANGE_PASSWORD: "/api/v1/me/password",
    DASHBOARD: "/api/v1/me/dashboard",
  },

  // Tests endpoints
  TESTS: {
    LIST: "/api/v1/tests/",
    GET: (testId: string) => `/api/v1/tests/${testId}`,
    QUESTIONS: (testId: string) => `/api/v1/tests/${testId}/questions`,
    QUESTION: (testId: string, questionId: string) =>
      `/api/v1/tests/${testId}/questions/${questionId}`,
    SUBMIT: (testId: string) => `/api/v1/tests/${testId}/submit`,
  },

  // Category endpoints
  CATEGORIES: {
    LIST: "/api/v1/categories",
    GET: (categoryId: string) => `/api/v1/categories/${categoryId}`,
    TESTS: (categoryId: string) => `/api/v1/categories/${categoryId}/tests`,
  },

  // Response endpoints
  RESPONSES: {
    DASHBOARD: "/api/v1/me/dashboard",
  },

  // Questions endpoints (available from backend)
  QUESTIONS: {
    LIST: "/api/v1/questions",
    GET: (questionId: string) => `/api/v1/questions/${questionId}`,
    ANSWERS: (questionId: string) => `/api/v1/questions/${questionId}/answers`,
  },
} as const;

// API Configuration
export const API_CONFIG = {
  CONTENT_TYPE: "application/json",
  AUTHORIZATION_PREFIX: "Bearer",
} as const;
