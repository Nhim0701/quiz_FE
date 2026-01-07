// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    ME: "/api/v1/users/me",
  },

  // Question endpoints
  QUESTIONS: {
    CATEGORIES: "/api/v1/questions/categories",
    CATEGORIES_WITH_SETS: "/api/v1/questions/categories-with-sets",
    BY_CATEGORY: (category: string) => `/api/v1/questions/by-category/${category}`,
    BY_CATEGORY_AND_SET: (category: string, questionSet: string) =>
      `/api/v1/questions/by-category/${category}/set/${questionSet}`,
  },

  // Response endpoints
  RESPONSES: {
    DASHBOARD: "/api/v1/responses/dashboard",
    SUBMIT_BULK: "/api/v1/responses/submit-bulk",
  },
} as const;

// API Configuration
export const API_CONFIG = {
  CONTENT_TYPE: "application/json",
  AUTHORIZATION_PREFIX: "Bearer",
} as const;

