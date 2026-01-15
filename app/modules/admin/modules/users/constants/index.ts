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

export const ERROR_MESSAGES = {
  FETCH_FAILED: "admin.users.errors.fetchFailed",
  CREATE_FAILED: "admin.users.errors.createFailed",
  UPDATE_FAILED: "admin.users.errors.updateFailed",
  DELETE_FAILED: "admin.users.errors.deleteFailed",
  CHANGE_PASSWORD_FAILED: "admin.users.errors.changePasswordFailed",
  ASSIGN_ROLES_FAILED: "admin.users.errors.assignRolesFailed",
} as const;

export const DEFAULT_VALUES = {
  PAGE: 1,
  PAGE_SIZE: 10,
} as const;
