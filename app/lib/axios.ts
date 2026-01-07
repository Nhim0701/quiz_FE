import { tokenManager } from "@/lib/api";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";
import { toast } from "sonner";
import { API_CONFIG, ROUTES, SESSION_KEYS } from "@/constants";
import { useAuthStoreInternal } from "@/hooks/useAuth";
import { t } from "@/i18n/utils";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": API_CONFIG.CONTENT_TYPE,
  },
});

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
  (error: AxiosError<ApiErrorResponse>) => {
    console.error("API Error:", error);

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Clear token and user
      tokenManager.removeToken();
      useAuthStoreInternal.getState().clearUser();

      // Show error toast
      toast.error(t("errors.sessionExpired"));

      // Store current path for redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== ROUTES.LOGIN && currentPath !== ROUTES.REGISTER) {
        sessionStorage.setItem(SESSION_KEYS.REDIRECT_PATH, currentPath);
      }

      // Redirect to login
      window.location.href = ROUTES.LOGIN;
      return Promise.reject(error);
    }

    // Handle error responses (4xx, 5xx) with standard structure
    if (error.response) {
      const errorData = error.response.data;

      // Check if response follows standard error structure
      if (errorData?.error) {
        const { code, message, trace_id, details } = errorData.error;

        // Create error object with standard structure
        const apiError = new Error(message) as Error & {
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
