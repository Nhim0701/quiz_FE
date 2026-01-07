// API utility for backend communication
import { AxiosResponse } from "axios";
import { STORAGE_KEYS } from "@/constants";
import { ApiSuccessResponse } from "@/types";

// Token management
export const tokenManager = {
  getToken: (): string | null =>
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  setToken: (token: string): void =>
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
  removeToken: (): void => localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
  hasToken: (): boolean => !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
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
