export const ROUTES = {
  INDEX: "/admin/categories",
} as const;

export const ENDPOINTS = {
  LIST: "/api/v1/categories",
  GET: (id: string) => `/api/v1/categories/${id}`,
  CREATE: "/api/v1/categories",
  UPDATE: (id: string) => `/api/v1/categories/${id}`,
  DELETE: (id: string) => `/api/v1/categories/${id}`,

  TESTS: (categoryId: string) => `/api/v1/categories/${categoryId}/tests`,
};

export const ERROR_MESSAGES = {
  FETCH_FAILED: "admin.categories.errors.fetchFailed",
  CREATE_FAILED: "admin.categories.errors.createFailed",
  UPDATE_FAILED: "admin.categories.errors.updateFailed",
  DELETE_FAILED: "admin.categories.errors.deleteFailed",
} as const;

export const DEFAULT_VALUES = {
  PAGE: 1,
  PAGE_SIZE: 10,
} as const;
