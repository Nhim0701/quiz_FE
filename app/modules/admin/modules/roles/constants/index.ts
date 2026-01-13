export const ROUTES = {
  INDEX: "/admin/roles",
} as const;

export const ENDPOINTS = {
  LIST: "/api/v1/roles",
  GET: (roleId: string) => `/api/v1/roles/${roleId}`,
  CREATE: "/api/v1/roles",
  UPDATE: (roleId: string) => `/api/v1/roles/${roleId}`,
  DELETE: (roleId: string) => `/api/v1/roles/${roleId}`,
} as const;
