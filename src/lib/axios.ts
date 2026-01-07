import { tokenManager } from "@/lib/api";
import axios, { AxiosError, AxiosInstance } from "axios";
import { toast } from "sonner";
import {
  API_CONFIG,
  ERROR_MESSAGES,
  ROUTES,
  SESSION_KEYS,
} from "@/constants";
import { useAuthStoreInternal } from "@/hooks/useAuth";

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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    console.error("API Error:", error);

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Clear token and user
      tokenManager.removeToken();
      useAuthStoreInternal.getState().clearUser();

      // Show error toast
      toast.error(ERROR_MESSAGES.SESSION_EXPIRED);

      // Store current path for redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== ROUTES.LOGIN && currentPath !== ROUTES.REGISTER) {
        sessionStorage.setItem(SESSION_KEYS.REDIRECT_PATH, currentPath);
      }

      // Redirect to login
      window.location.href = ROUTES.LOGIN;
      return Promise.reject(error);
    }

    // Handle other error responses
    if (error.response) {
      const data = error.response.data as { detail?: string };
      const errorMessage =
        data?.detail ||
        `${ERROR_MESSAGES.HTTP_ERROR} ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    } else {
      throw new Error(`${ERROR_MESSAGES.REQUEST_ERROR}: ${error.message}`);
    }
  }
);

export default apiClient;
