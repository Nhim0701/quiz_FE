export const ROUTES = {
  ROLES: {
    INDEX: "/admin/roles-permissions/roles",
  },
  PERMISSIONS: {
    INDEX: "/admin/roles-permissions/permissions",
  },
} as const;

export const ENDPOINTS = {
  ROLES: {
    LIST: "/api/v1/roles",
    GET: (roleId: string) => `/api/v1/roles/${roleId}`,
    CREATE: "/api/v1/roles",
    UPDATE: (roleId: string) => `/api/v1/roles/${roleId}`,
    DELETE: (roleId: string) => `/api/v1/roles/${roleId}`,
  },
  PERMISSIONS: {
    LIST: "/api/v1/permissions",
    GET: (permissionId: string) => `/api/v1/permissions/${permissionId}`,
    CREATE: "/api/v1/permissions",
    UPDATE: (permissionId: string) => `/api/v1/permissions/${permissionId}`,
    DELETE: (permissionId: string) => `/api/v1/permissions/${permissionId}`,
  },
} as const;
