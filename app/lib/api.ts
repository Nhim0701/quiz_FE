// API utility for backend communication
import type { AxiosResponse } from "axios";
import { STORAGE_KEYS } from "@/constants";
import type { ApiSuccessResponse } from "@/types";

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
};

// Helper function to extract data from standard API response
export const extractApiData = <T>(
  response: AxiosResponse<ApiSuccessResponse<T> | T>
): T => {
  const responseData = response.data;

  // If response has standard structure { data, meta }
  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData &&
    !Array.isArray(responseData)
  ) {
    const apiResponse = responseData as ApiSuccessResponse<T>;
    return apiResponse.data;
  }

  // Fallback: return response data as is (for backward compatibility)
  return responseData as T;
};

// Helper function to extract meta from standard API response
export const extractApiMeta = (
  response: AxiosResponse<ApiSuccessResponse | unknown>
): Record<string, unknown> | undefined => {
  const responseData = response.data;

  if (
    responseData &&
    typeof responseData === "object" &&
    "meta" in responseData &&
    !Array.isArray(responseData)
  ) {
    const apiResponse = responseData as ApiSuccessResponse;
    return apiResponse.meta;
  }

  return undefined;
};
