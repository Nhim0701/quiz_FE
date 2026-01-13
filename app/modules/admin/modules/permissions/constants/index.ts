export const ROUTES = {
  INDEX: "/admin/permissions",
} as const;

export const ENDPOINTS = {
  LIST: "/api/v1/permissions",
  GET: (permissionId: string) => `/api/v1/permissions/${permissionId}`,
  CREATE: "/api/v1/permissions",
  UPDATE: (permissionId: string) => `/api/v1/permissions/${permissionId}`,
  DELETE: (permissionId: string) => `/api/v1/permissions/${permissionId}`,
} as const;
