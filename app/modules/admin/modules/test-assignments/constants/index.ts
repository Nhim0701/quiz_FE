export const ROUTES = {
  INDEX: "/admin/test-assignments",
} as const;

export const ENDPOINTS = {
  LIST: "/api/v1/test-assignments",
  GET: (id: string) => `/api/v1/test-assignments/${id}`,
  CREATE: "/api/v1/test-assignments",
  DELETE: (id: string) => `/api/v1/test-assignments/${id}`,
};

export const ERROR_MESSAGES = {
  FETCH_FAILED: "admin.testAssignments.errors.fetchFailed",
  CREATE_FAILED: "admin.testAssignments.errors.createFailed",
  DELETE_FAILED: "admin.testAssignments.errors.deleteFailed",
} as const;

export const DEFAULT_VALUES = {
  PAGE: 1,
  PAGE_SIZE: 10,
} as const;
