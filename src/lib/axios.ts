import { tokenManager } from "@/lib/api";
import axios, { AxiosError, AxiosInstance } from "axios";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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

export default apiClient;
