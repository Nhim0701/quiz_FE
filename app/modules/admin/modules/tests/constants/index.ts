export const ROUTES = {
  INDEX: "/admin/tests",
} as const;

export const ENDPOINTS = {
  LIST: "/api/v1/tests",
  GET: (id: string) => `/api/v1/tests/${id}`,
  CREATE: "/api/v1/tests",
  UPDATE: (id: string) => `/api/v1/tests/${id}`,
  DELETE: (id: string) => `/api/v1/tests/${id}`,
} as const;

export const ERROR_MESSAGES = {
  FETCH_FAILED: "admin.tests.errors.fetchFailed",
  CREATE_FAILED: "admin.tests.errors.createFailed",
  UPDATE_FAILED: "admin.tests.errors.updateFailed",
  DELETE_FAILED: "admin.tests.errors.deleteFailed",
} as const;

export const DEFAULT_VALUES = {
  PAGE: 1,
  PAGE_SIZE: 10,
} as const;
