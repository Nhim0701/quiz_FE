/**
 * Profile-specific API endpoints
 */
export const PROFILE_API_ENDPOINTS = {
  GET: "/api/v1/me",
  UPDATE: "/api/v1/me",
  CHANGE_PASSWORD: "/api/v1/me/password",
} as const;

/**
 * Profile routes
 */
export const ROUTES = {
  INDEX: "/profile",
} as const;
