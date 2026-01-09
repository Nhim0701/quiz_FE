import { tokenManager } from "@/lib/api";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, API_CONFIG, ERROR } from "@/constants";
import { t } from "@/i18n/utils";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types";
import type { TranslationKey } from "@/i18n";
import { toCamelCase, toSnakeCase } from "@/lib/case-converter";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": API_CONFIG.CONTENT_TYPE,
  },
});

// Request interceptor to add token, check expiration, and convert request data
apiClient.interceptors.request.use(
  async (config) => {
    const token = tokenManager.getToken();

    if (token) {
      // Check if token is expired or will expire soon (60 seconds buffer)
      if (tokenManager.isTokenExpired(60)) {
        const refreshToken = tokenManager.getRefreshToken();

        if (!refreshToken) {
          // No refresh token, clear and redirect
          tokenManager.redirectToLoginOnExpired();
          return Promise.reject(
            new Error("Token expired and no refresh token available")
          );
        }

        try {
          // Attempt to refresh token
          const newToken = await tokenManager.attemptRefresh();
          config.headers.Authorization = `${API_CONFIG.AUTHORIZATION_PREFIX} ${newToken}`;
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      } else {
        // Token is valid, add to request
        config.headers.Authorization = `${API_CONFIG.AUTHORIZATION_PREFIX} ${token}`;
      }
    }

    // Convert request data from camelCase to snake_case
    if (config.data && typeof config.data === "object") {
      config.data = toSnakeCase(config.data);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling standard response structure and converting to camelCase
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiSuccessResponse | unknown>) => {
    // For success responses (2xx), check if response follows standard structure
    // If response has { data, meta } structure, convert data to camelCase
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      const apiResponse = response.data as ApiSuccessResponse;
      // Convert data from snake_case to camelCase
      const convertedData = toCamelCase(apiResponse.data);
      // Convert meta if exists
      const convertedMeta = apiResponse.meta
        ? toCamelCase(apiResponse.meta)
        : undefined;
      return {
        ...response,
        data: {
          ...apiResponse,
          data: convertedData,
          meta: convertedMeta,
        },
      } as AxiosResponse<ApiSuccessResponse>;
    }
    // For non-standard responses, convert the entire response data
    if (response.data && typeof response.data === "object") {
      return {
        ...response,
        data: toCamelCase(response.data),
      };
    }
    // Pass through other responses
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
      originalRequest._retry = true;

      try {
        const newToken = await tokenManager.attemptRefresh();

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `${API_CONFIG.AUTHORIZATION_PREFIX} ${newToken}`;
        }

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Handle error responses (4xx, 5xx) with standard structure
    if (error.response) {
      const errorData = error.response.data;

      // Check if response follows standard error structure
      if (errorData?.error) {
        // Convert error response from snake_case to camelCase
        const convertedError = toCamelCase(errorData.error) as {
          code: string;
          message: string;
          traceId: string;
          details?: unknown[] | Record<string, unknown> | null;
        };

        const { code, message, traceId, details } = convertedError;

        // Get i18n message from error code
        const errorMessage = t(
          ERROR[code as keyof typeof ERROR].MESSAGE_KEY as TranslationKey
        );

        // Create error object with standard structure
        const apiError = new Error(errorMessage) as Error & {
          code: string;
          traceId: string;
          details?: unknown[] | Record<string, unknown> | null;
          status?: number;
        };

        apiError.code = code;
        apiError.traceId = traceId;
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
