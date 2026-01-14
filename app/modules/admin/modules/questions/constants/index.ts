export const ROUTES = {
  INDEX: "/admin/questions",
  VIEW: (questionId: string) => `/admin/questions/${questionId}`,
} as const;

export const ENDPOINTS = {
  LIST: "/api/v1/questions",
  GET: (questionId: string) => `/api/v1/questions/${questionId}`,
  CREATE: "/api/v1/questions",
  UPDATE: (questionId: string) => `/api/v1/questions/${questionId}`,
  DELETE: (questionId: string) => `/api/v1/questions/${questionId}`,
  ANSWERS: {
    LIST: "/api/v1/answers",
    CREATE: "/api/v1/answers",
    UPDATE: (answerId: string) => `/api/v1/answers/${answerId}`,
    DELETE: (answerId: string) => `/api/v1/answers/${answerId}`,
  },
} as const;

export const ERROR_MESSAGES = {
  FETCH_FAILED: "admin.questions.errors.fetchFailed",
  CREATE_FAILED: "admin.questions.errors.createFailed",
  UPDATE_FAILED: "admin.questions.errors.updateFailed",
  DELETE_FAILED: "admin.questions.errors.deleteFailed",
} as const;

export const DEFAULT_VALUES = {
  PAGE: 1,
  PAGE_SIZE: 10,
} as const;
