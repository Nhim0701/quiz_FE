// API utility for backend communication
import { AxiosRequestConfig } from "axios";
import { ResponseItem } from "../types";
import apiClient from "@/lib/axios";

// Token management
export const tokenManager = {
  getToken: (): string | null => localStorage.getItem("access_token"),
  setToken: (token: string): void =>
    localStorage.setItem("access_token", token),
  removeToken: (): void => localStorage.removeItem("access_token"),
  hasToken: (): boolean => !!localStorage.getItem("access_token"),
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

export const questionApi = {
  getCategories: async <T>(): Promise<T> => {
    const response = await apiClient.get<T>("/api/v1/questions/categories");
    return response.data;
  },

  getCategoriesWithSets: async <T>(): Promise<T> => {
    const response = await apiClient.get<T>(
      "/api/v1/questions/categories-with-sets"
    );
    return response.data;
  },

  getQuestionsByCategory: async <T>(category: string): Promise<T> => {
    const response = await apiClient.get<T>(
      `/api/v1/questions/by-category/${category}`
    );
    return response.data;
  },

  getQuestionsByCategoryAndSet: async <T>(
    category: string,
    questionSet: string
  ): Promise<T> => {
    const response = await apiClient.get<T>(
      `/api/v1/questions/by-category/${category}/set/${questionSet}`
    );
    return response.data;
  },
};

// Common APIs
export const commonApi = {
  getDashboard: async <T>(): Promise<T> => {
    const response = await apiClient.get<T>("/api/v1/responses/dashboard");
    return response.data;
  },
  submitBulk: async <T>(responses: ResponseItem[]): Promise<T> => {
    const response = await apiClient.post("/api/v1/responses/submit-bulk", {
      responses,
    });
    return response.data;
  },
};

export default apiFetch;
