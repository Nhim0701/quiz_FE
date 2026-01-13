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
