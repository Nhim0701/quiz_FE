/**
 * Admin Questions routes
 */
export const ROUTES = {
  QUESTIONS: {
    INDEX: "/admin/questions",
    NEW: "/admin/questions/new",
    EDIT: "/admin/questions/:questionId",
  },
} as const;

export const ENDPOINTS = {
  QUESTIONS: {
    LIST: "/api/v1/questions",
    GET: (questionId: string) => `/api/v1/questions/${questionId}`,
    CREATE: "/api/v1/questions",
    UPDATE: (questionId: string) => `/api/v1/questions/${questionId}`,
    DELETE: (questionId: string) => `/api/v1/questions/${questionId}`,
  },
  ANSWERS: {
    LIST: (questionId: string) => `/api/v1/questions/${questionId}/answers`,
    CREATE: "/api/v1/answers",
    UPDATE: (answerId: string) => `/api/v1/answers/${answerId}`,
    DELETE: (answerId: string) => `/api/v1/answers/${answerId}`,
  },
} as const;
