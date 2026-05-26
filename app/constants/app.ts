const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (!rawApiBaseUrl && import.meta.env.PROD) {
  console.error(
    "[Config] VITE_API_BASE_URL is not set. API calls will use relative paths and may be served as HTML by the CDN. Set VITE_API_BASE_URL to the backend origin in your production build environment."
  );
}
export const API_BASE_URL = rawApiBaseUrl || "/";

// API Configuration
export const API_CONFIG = {
  CONTENT_TYPE: "application/json",
  AUTHORIZATION_PREFIX: "Bearer",
  UPLOAD_FILE: "/api/v1/uploads",
} as const;

// Application Routes
export const ROUTES = {
  HOME: "/",
  ADMIN: "/admin",
} as const;

/**
 * Pagination constants
 */

export const DEFAULT_PAGE_SIZE = 10;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const MAX_PAGE_SIZE_FOR_ALL = 100;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  MAX_PAGE_SIZE_FOR_ALL,
  MAX_VISIBLE_PAGES: 3, // Number of page buttons to show around current page
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  THEME: "theme",
} as const;

// SessionStorage Keys
export const SESSION_KEYS = {
  REDIRECT_PATH: "redirect_path",
} as const;

// Theme values
export const THEME_VALUES = {
  LIGHT: "light",
  DARK: "dark",
} as const;

// Toast class names
export const TOAST_CLASSES = {
  ERROR: "toast-error",
  SUCCESS: "toast-success",
  INFO: "toast-info",
  WARNING: "toast-warning",
} as const;
