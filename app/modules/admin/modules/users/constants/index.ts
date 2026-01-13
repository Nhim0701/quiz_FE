export const ROUTES = {
  INDEX: "/admin/users",
} as const;

export const ENDPOINTS = {
  LIST: "/api/v1/users",
  GET: (id: string) => `/api/v1/users/${id}`,
  CREATE: "/api/v1/users",
  UPDATE: (id: string) => `/api/v1/users/${id}`,
  DELETE: (id: string) => `/api/v1/users/${id}`,
  CHANGE_PASSWORD: (id: string) => `/api/v1/users/${id}/change-password`,
  ASSIGN_ROLES: (id: string) => `/api/v1/users/${id}/roles`,
};
