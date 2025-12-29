// API utility for backend communication
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { ResponseItem } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://harinezumi.myddns.me";

// Token management
export const tokenManager = {
  getToken: (): string | null => localStorage.getItem("access_token"),
  setToken: (token: string): void =>
    localStorage.setItem("access_token", token),
  removeToken: (): void => localStorage.removeItem("access_token"),
  hasToken: (): boolean => !!localStorage.getItem("access_token"),
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    console.error("API Error:", error);

    // Handle error response
    if (error.response) {
      const data = error.response.data as { detail?: string };
      const errorMessage =
        data?.detail || `HTTP error! status: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Network error: No response received from server");
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
);

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
