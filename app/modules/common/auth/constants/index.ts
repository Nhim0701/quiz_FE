/**
 * Auth-specific API endpoints
 */
export const AUTH_API_ENDPOINTS = {
  LOGIN: "/api/v1/auth/login",
  REGISTER: "/api/v1/auth/register",
  REFRESH: "/api/v1/auth/token/refresh",
  REVOKE: "/api/v1/auth/token/revoke",
} as const;

/**
 * Me endpoints (user profile)
 */
export const ME_API_ENDPOINTS = {
  GET: "/api/v1/me",
  UPDATE: "/api/v1/me",
  CHANGE_PASSWORD: "/api/v1/me/password",
  DASHBOARD: "/api/v1/me/dashboard",
} as const;

/**
 * Auth storage keys
 */
export const AUTH_STORAGE_KEYS = {
  AUTH: "auth-storage",
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

/**
 * Auth routes
 */
export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
} as const;
