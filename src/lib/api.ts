// API utility for backend communication
import { AxiosRequestConfig } from "axios";
import { ResponseItem } from "../types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/constants";

// Token management
export const tokenManager = {
  getToken: (): string | null =>
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  setToken: (token: string): void =>
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
  removeToken: (): void => localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
  hasToken: (): boolean => !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
};

// Base API fetch wrapper (for backward compatibility)
async function apiFetch<T>(
  url: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      url,
      ...options,
    });
    return response.data;
  } catch (error) {
    // Error is already handled by interceptor
    throw error;
  }
}

// Common APIs
export const commonApi = {
  getDashboard: async <T>(): Promise<T> => {
    const response = await apiClient.get<T>(API_ENDPOINTS.RESPONSES.DASHBOARD);
    return response.data;
  },
  submitBulk: async <T>(responses: ResponseItem[]): Promise<T> => {
    const response = await apiClient.post(API_ENDPOINTS.RESPONSES.SUBMIT_BULK, {
      responses,
    });
    return response.data;
  },
};

export default apiFetch;
