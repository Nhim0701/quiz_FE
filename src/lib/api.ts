// API utility for backend communication
import { AxiosRequestConfig } from "axios";
import apiClient from "@/lib/axios";
import { STORAGE_KEYS } from "@/constants";

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

export default apiFetch;
