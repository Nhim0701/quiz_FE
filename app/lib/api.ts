// API utility for backend communication
import { jwtDecode, type JwtPayload } from "jwt-decode";
import axios from "axios";
import { toast } from "sonner";
import {
  API_BASE_URL,
  API_CONFIG,
  API_ENDPOINTS,
  ROUTES,
  SESSION_KEYS,
  STORAGE_KEYS,
} from "@/constants";
import { useAuthStoreInternal } from "@/hooks/useAuth";
import { t } from "@/i18n/utils";
import type { ApiSuccessResponse } from "@/types";
import type { AuthResponse } from "@/hooks/useAuth";
import apiClient from "@/lib/axios";

// interface JwtPayload {
//   exp?: number;
//   [key: string]: unknown;
// }

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
 * @param bufferSeconds Buffer time in seconds before considering token expired (default: 60)
 * @returns true if token is expired or will expire within buffer time
 */
const isTokenExpired = (token: string, bufferSeconds: number = 60): boolean => {
  const exp = getTokenExpiration(token);
  if (!exp) {
    return true; // Consider invalid token as expired
  }

  const now = Math.floor(Date.now() / 1000);
  return exp <= now + bufferSeconds;
};

// Refresh token management state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Redirect to login page and save current path
 */
const redirectToLogin = () => {
  const currentPath = window.location.pathname;
  if (currentPath !== ROUTES.LOGIN && currentPath !== ROUTES.REGISTER) {
    sessionStorage.setItem(SESSION_KEYS.REDIRECT_PATH, currentPath);
  }
  window.location.href = ROUTES.LOGIN;
};

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    return (
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    );
  },
  setToken: (token: string, rememberMe: boolean = false): void => {
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  setRefreshToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },
  removeToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  hasToken: (): boolean => {
    return !!(
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    );
  },
  /**
   * Check if current token is expired
   * @param bufferSeconds Buffer time in seconds before considering token expired (default: 60)
   * @returns true if token is expired or will expire within buffer time
   */
  isTokenExpired: (bufferSeconds: number = 60): boolean => {
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
      throw new Error("No refresh token available");
    }

    // Use apiClient to get automatic case conversion
    const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REFRESH,
      {
        // Request data in camelCase - will be converted to snake_case by interceptor
        refreshToken: refreshToken,
      }
    );

    // Response data is already converted to camelCase by interceptor
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    // Store new tokens
    const hadRefreshToken = !!tokenManager.getRefreshToken();
    const shouldRemember = hadRefreshToken || !!newRefreshToken;
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
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            if (token && typeof token === "string") {
              resolve(token);
            } else {
              reject(new Error("Failed to get new token"));
            }
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await tokenManager.refreshAccessToken();
      processQueue(null, newToken);
      isRefreshing = false;
      return newToken;
    } catch (error) {
      processQueue(error as Error);
      isRefreshing = false;
      tokenManager.removeToken();
      useAuthStoreInternal.getState().clearUser();
      toast.error(t("errors.sessionExpired"));
      redirectToLogin();
      throw error;
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

