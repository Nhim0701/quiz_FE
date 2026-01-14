import { tokenManager, toCamelCase, toSnakeCase } from "@/lib";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, API_CONFIG, ERROR } from "@/constants";
import { ENDPOINTS as AUTH_ENDPOINTS } from "@/modules/common/auth/constants";
import { t } from "@/i18n/utils";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types";
import type { TranslationKey } from "@/i18n";

// Constants
const TOKEN_EXPIRATION_BUFFER_SECONDS = 60;
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_FORBIDDEN = 403;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": API_CONFIG.CONTENT_TYPE,
  },
});

// Auth endpoints that don't require token refresh
const authEndpoints = [
  AUTH_ENDPOINTS.LOGIN,
  AUTH_ENDPOINTS.REGISTER,
  AUTH_ENDPOINTS.REFRESH,
];

// Check if request is to an auth endpoint
const isAuthEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return authEndpoints.some((endpoint) => url.includes(endpoint));
};

// Convert request data and params from camelCase to snake_case
const convertRequestData = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  if (config.data && typeof config.data === "object") {
    config.data = toSnakeCase(config.data);
  }
  if (config.params && typeof config.params === "object") {
    config.params = toSnakeCase(config.params);
  }
  return config;
};

// Set authorization header
const setAuthHeader = (
  config: InternalAxiosRequestConfig,
  token: string
): void => {
  config.headers.Authorization = `${API_CONFIG.AUTHORIZATION_PREFIX} ${token}`;
};

// Create API error object
const createApiError = (
  message: string,
  code: string,
  status: number,
  traceId?: string,
  details?: unknown[] | Record<string, unknown> | null
): Error & {
  code: string;
  traceId?: string;
  details?: unknown[] | Record<string, unknown> | null;
  status: number;
} => {
  const error = new Error(message) as Error & {
    code: string;
    traceId?: string;
    details?: unknown[] | Record<string, unknown> | null;
    status: number;
  };
  error.code = code;
  error.status = status;
  if (traceId) error.traceId = traceId;
  if (details !== undefined) error.details = details;
  return error;
};

// Extract error message from various response formats
const extractErrorMessage = (errorData: unknown): string => {
  if (!errorData || typeof errorData !== "object") {
    return typeof errorData === "string" ? errorData : t("errors.requestError");
  }

  const data = errorData as Record<string, unknown>;

  if (typeof data.message === "string") {
    return data.message;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.details)) {
    return data.details
      .map((detail) => {
        if (typeof detail === "string") return detail;
        if (typeof detail === "object" && detail !== null) {
          const detailObj = detail as Record<string, unknown>;
          if (typeof detailObj.message === "string") {
            return detailObj.message;
          }
          return JSON.stringify(detailObj);
        }
        return String(detail);
      })
      .join(", ");
  }

  if (data.details && typeof data.details === "object") {
    const detailsObj = data.details as Record<string, unknown>;
    const messages = Object.entries(detailsObj)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(", ")}`;
        }
        return `${key}: ${String(value)}`;
      })
      .join("; ");
    return messages || t("errors.requestError");
  }

  return t("errors.requestError");
};

// Handle standard API error response
const handleStandardError = (
  error: AxiosError<ApiErrorResponse>,
  apiErrorResponse: ApiErrorResponse
): Error => {
  const convertedError = toCamelCase(apiErrorResponse.error) as {
    code: string;
    message: string;
    traceId: string;
    details?: unknown[] | Record<string, unknown> | null;
  };

  const { code, traceId, details } = convertedError;
  const errorConfig = ERROR[code as keyof typeof ERROR];

  const errorMessage = errorConfig
    ? t(errorConfig.MESSAGE_KEY as TranslationKey)
    : t("errors.requestError");

  return createApiError(
    errorMessage,
    code,
    error.response!.status,
    traceId,
    details
  );
};

// Request interceptor to add token, check expiration, and convert request data
apiClient.interceptors.request.use(
  async (config) => {
    // Convert request data and params from camelCase to snake_case
    convertRequestData(config);

    // Skip token handling for auth endpoints (login, register, refresh)
    if (isAuthEndpoint(config.url)) {
      return config;
    }

    const token = tokenManager.getToken();
    if (!token) {
      return config;
    }

    // Check if token is expired or will expire soon
    if (tokenManager.isTokenExpired(TOKEN_EXPIRATION_BUFFER_SECONDS)) {
      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        tokenManager.redirectToLoginOnExpired();
        return Promise.reject(new Error(t("errors.tokenExpiredNoRefresh")));
      }

      try {
        const newToken = await tokenManager.attemptRefresh();
        setAuthHeader(config, newToken);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    } else {
      setAuthHeader(config, token);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling standard response structure and converting to camelCase
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiSuccessResponse | unknown>) => {
    // For success responses (2xx), check if response follows standard structure
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      const apiResponse = response.data as ApiSuccessResponse;
      return {
        ...response,
        data: {
          ...apiResponse,
          data: toCamelCase(apiResponse.data),
          meta: apiResponse.meta ? toCamelCase(apiResponse.meta) : undefined,
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

    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - try to refresh token
    if (
      error.response?.status === HTTP_STATUS_UNAUTHORIZED &&
      error.response?.data?.error?.code !==
        ERROR.INCORRECT_EMAIL_OR_PASSWORD.CODE &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await tokenManager.attemptRefresh();
        if (originalRequest.headers) {
          setAuthHeader(originalRequest, newToken);
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Handle error responses (4xx, 5xx)
    if (error.response) {
      const errorData = error.response.data as unknown;
      const apiErrorResponse = errorData as ApiErrorResponse;

      // Handle standard API error structure
      if (apiErrorResponse?.error) {
        return Promise.reject(handleStandardError(error, apiErrorResponse));
      }

      // Handle specific HTTP status codes
      if (error.response.status === HTTP_STATUS_FORBIDDEN) {
        throw createApiError(
          t(ERROR.PERMISSION_DENIED.MESSAGE_KEY as TranslationKey),
          ERROR.PERMISSION_DENIED.CODE,
          HTTP_STATUS_FORBIDDEN
        );
      }

      // Fallback for non-standard error responses
      const errorMessage =
        error.response.status >= 500
          ? `${t("errors.httpError")} ${error.response.status}`
          : extractErrorMessage(errorData);

      throw new Error(errorMessage);
    }

    // Handle network errors
    if (error.request) {
      throw new Error(t("errors.networkError"));
    }

    // Handle request setup errors
    throw new Error(`${t("errors.requestError")}: ${error.message}`);
  }
);

export default apiClient;
