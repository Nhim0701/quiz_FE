import { tokenManager } from "@/lib/api";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { API_CONFIG, API_ENDPOINTS, ERROR, ROUTES, SESSION_KEYS } from "@/constants";
import { useAuthStoreInternal } from "@/hooks/useAuth";
import { t } from "@/i18n/utils";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types";
import type { TranslationKey } from "@/i18n";

interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": API_CONFIG.CONTENT_TYPE,
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

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

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `${API_CONFIG.AUTHORIZATION_PREFIX} ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling standard response structure
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiSuccessResponse | unknown>) => {
    // For success responses (2xx), check if response follows standard structure
    // If response has { data, meta } structure, return as is
    // Otherwise, pass through and let helper functions handle extraction
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      // Already in standard format { data, meta }
      return response as AxiosResponse<ApiSuccessResponse>;
    }
    // Pass through non-standard responses (will be handled by helper functions)
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - try to refresh token
    if (
      error.response?.status === 401 &&
      error.response?.data?.error?.code !==
        ERROR.INCORRECT_EMAIL_OR_PASSWORD.CODE &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `${API_CONFIG.AUTHORIZATION_PREFIX} ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        // No refresh token, redirect to login
        processQueue(new Error("No refresh token"));
        isRefreshing = false;
        tokenManager.removeToken();
        useAuthStoreInternal.getState().clearUser();
        toast.error(t("errors.sessionExpired"));

        const currentPath = window.location.pathname;
        if (currentPath !== ROUTES.LOGIN && currentPath !== ROUTES.REGISTER) {
          sessionStorage.setItem(SESSION_KEYS.REDIRECT_PATH, currentPath);
        }
        window.location.href = ROUTES.LOGIN;
        return Promise.reject(error);
      }

      try {
        // Try to refresh token
        const response = await axios.post<ApiSuccessResponse<AuthResponse>>(
          `${import.meta.env.VITE_API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refresh_token: refreshToken },
          {
            headers: {
              "Content-Type": API_CONFIG.CONTENT_TYPE,
            },
          }
        );

        const { access_token, refresh_token: newRefreshToken } =
          response.data.data;

        // Store new tokens
        // If we had a refresh token before, we should use localStorage (rememberMe = true)
        // Otherwise, check if new refresh token exists
        const hadRefreshToken = !!tokenManager.getRefreshToken();
        const shouldRemember = hadRefreshToken || !!newRefreshToken;
        tokenManager.setToken(access_token, shouldRemember);
        
        if (newRefreshToken) {
          tokenManager.setRefreshToken(newRefreshToken);
        }

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `${API_CONFIG.AUTHORIZATION_PREFIX} ${access_token}`;
        }

        // Process queued requests
        processQueue(null, access_token);
        isRefreshing = false;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        processQueue(refreshError as Error);
        isRefreshing = false;
        tokenManager.removeToken();
        useAuthStoreInternal.getState().clearUser();
        toast.error(t("errors.sessionExpired"));

        const currentPath = window.location.pathname;
        if (currentPath !== ROUTES.LOGIN && currentPath !== ROUTES.REGISTER) {
          sessionStorage.setItem(SESSION_KEYS.REDIRECT_PATH, currentPath);
        }
        window.location.href = ROUTES.LOGIN;
        return Promise.reject(refreshError);
      }
    }

    // Handle error responses (4xx, 5xx) with standard structure
    if (error.response) {
      const errorData = error.response.data;

      // Check if response follows standard error structure
      if (errorData?.error) {
        const { code, message, trace_id, details } = errorData.error;

        // Get i18n message from error code
        const errorMessage = t(
          ERROR[code as keyof typeof ERROR].MESSAGE_KEY as TranslationKey
        );

        // Create error object with standard structure
        const apiError = new Error(errorMessage) as Error & {
          code: string;
          trace_id: string;
          details?: unknown[] | Record<string, unknown> | null;
          status?: number;
        };

        apiError.code = code;
        apiError.trace_id = trace_id;
        apiError.details = details || null;
        apiError.status = error.response.status;

        return Promise.reject(apiError);
      }

      // Fallback for non-standard error responses
      const errorMessage =
        (errorData as { detail?: string })?.detail ||
        `${t("errors.httpError")} ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error(t("errors.networkError"));
    } else {
      throw new Error(`${t("errors.requestError")}: ${error.message}`);
    }
  }
);

export default apiClient;
