// API utility for backend communication
import { jwtDecode, type JwtPayload } from "jwt-decode";
import { toast } from "sonner";
import { SESSION_KEYS } from "@/constants";
import { useAuthStoreInternal } from "@/modules/common/auth/hooks/use-auth";
import {
  ROUTES as AUTH_ROUTES,
  STORAGE_KEYS as AUTH_STORAGE_KEYS,
  ENDPOINTS as AUTH_ENDPOINTS,
} from "@/modules/common/auth/constants";
import { t } from "@/i18n/utils";
import type { ApiSuccessResponse } from "@/types";
import type { AuthResponse } from "@/modules/common/auth/types";
import { apiClient } from "@/lib";

// Constants
const DEFAULT_TOKEN_BUFFER_SECONDS = 60;

// Types
type QueuedRequest = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
};

/**
 * Decode JWT token payload
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

/**
 * Get expiration time from token
 * @param token JWT token string
 * @returns Expiration timestamp in seconds, or null if invalid
 */
const getTokenExpiration = (token: string): number | null => {
  const decoded = decodeToken(token);
  if (!decoded || typeof decoded.exp !== "number") {
    return null;
  }
  return decoded.exp;
};

/**
 * Check if token is expired
 * @param token JWT token string
 * @param bufferSeconds Buffer time in seconds before considering token expired
 * @returns true if token is expired or will expire within buffer time
 */
const isTokenExpired = (
  token: string,
  bufferSeconds: number = DEFAULT_TOKEN_BUFFER_SECONDS
): boolean => {
  const exp = getTokenExpiration(token);
  if (!exp) {
    return true; // Consider invalid token as expired
  }

  const now = Math.floor(Date.now() / 1000);
  return exp <= now + bufferSeconds;
};

// Refresh token management state
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  const queue = [...failedQueue];
  failedQueue = [];

  queue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    } else {
      prom.reject(new Error(t("errors.failedToGetNewToken")));
    }
  });
};

/**
 * Redirect to login page and save current path
 */
const redirectToLogin = () => {
  const currentPath = window.location.pathname;
  if (
    currentPath !== AUTH_ROUTES.LOGIN &&
    currentPath !== AUTH_ROUTES.REGISTER
  ) {
    sessionStorage.setItem(SESSION_KEYS.REDIRECT_PATH, currentPath);
  }
  window.location.href = AUTH_ROUTES.LOGIN;
};

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    return (
      localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) ||
      sessionStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) ||
      null
    );
  },
  setToken: (token: string, rememberMe: boolean = false): void => {
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    }
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  },
  setRefreshToken: (token: string): void => {
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
  },
  removeToken: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  },
  hasToken: (): boolean => {
    return !!tokenManager.getToken();
  },
  /**
   * Check if current token is expired
   * @param bufferSeconds Buffer time in seconds before considering token expired
   * @returns true if token is expired or will expire within buffer time
   */
  isTokenExpired: (
    bufferSeconds: number = DEFAULT_TOKEN_BUFFER_SECONDS
  ): boolean => {
    const token = tokenManager.getToken();
    if (!token) {
      return true;
    }
    return isTokenExpired(token, bufferSeconds);
  },
  /**
   * Get expiration time of current token
   * @returns Expiration timestamp in seconds, or null if invalid/not found
   */
  getTokenExpiration: (): number | null => {
    const token = tokenManager.getToken();
    if (!token) {
      return null;
    }
    return getTokenExpiration(token);
  },
  /**
   * Get remaining time until token expires
   * @returns Remaining time in seconds, or null if invalid/expired
   */
  getTokenRemainingTime: (): number | null => {
    const exp = tokenManager.getTokenExpiration();
    if (!exp) {
      return null;
    }
    const now = Math.floor(Date.now() / 1000);
    const remaining = exp - now;
    return remaining > 0 ? remaining : null;
  },
  /**
   * Refresh access token using refresh token
   * @returns Promise<string> - New access token
   */
  refreshAccessToken: async (): Promise<string> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error(t("errors.noRefreshToken"));
    }

    // Use apiClient to get automatic case conversion
    const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
      AUTH_ENDPOINTS.REFRESH,
      {
        // Request data in camelCase - will be converted to snake_case by interceptor
        refreshToken,
      }
    );

    // Response data is already converted to camelCase by interceptor
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    if (!accessToken) {
      throw new Error(t("errors.invalidRefreshResponse"));
    }

    // Store new tokens - preserve rememberMe preference if refresh token exists
    const shouldRemember = !!tokenManager.getRefreshToken();
    tokenManager.setToken(accessToken, shouldRemember);

    if (newRefreshToken) {
      tokenManager.setRefreshToken(newRefreshToken);
    }

    return accessToken;
  },
  /**
   * Attempt to refresh token and handle queue
   * @returns Promise<string> - New access token
   */
  attemptRefresh: async (): Promise<string> => {
    if (isRefreshing) {
      // Wait for ongoing refresh
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await tokenManager.refreshAccessToken();
      processQueue(null, newToken);
      return newToken;
    } catch (error) {
      const refreshError =
        error instanceof Error
          ? error
          : new Error(t("errors.tokenRefreshFailed"));
      processQueue(refreshError);
      tokenManager.removeToken();
      useAuthStoreInternal.getState().clearUser();
      toast.error(t("errors.sessionExpired"));
      redirectToLogin();
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  },
  /**
   * Redirect to login when token is expired and no refresh token available
   */
  redirectToLoginOnExpired: () => {
    tokenManager.removeToken();
    useAuthStoreInternal.getState().clearUser();
    redirectToLogin();
  },
};
