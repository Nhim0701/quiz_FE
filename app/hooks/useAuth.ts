import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/axios";
import { tokenManager } from "@/lib/api";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/constants";
import type { ApiSuccessResponse } from "@/types";

interface UserData {
  email: string;
  name: string;
  password: string;
}

interface Credentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

export interface User {
  name: string;
  email: string;
}

interface UserResponse {
  account_name: string;
  user_email: string;
  [key: string]: unknown;
}

interface AuthState {
  user: User | null;
  getCurrentUser: (setLoading?: (loading: boolean) => void) => Promise<void>;
  clearUser: () => void;
  register: (
    userData: UserData,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>;
  login: (
    credentials: Credentials,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>;
  logout: () => Promise<void>;
}

// Helper function to fetch user data
const fetchUserData = async (
  set: (state: Partial<AuthState>) => void,
  setLoading?: (loading: boolean) => void
): Promise<void> => {
  if (setLoading) setLoading(true);
  try {
    const response = await apiClient.get<ApiSuccessResponse<UserResponse>>(
      API_ENDPOINTS.ME.GET
    );
    set({
      user: {
        name: response.data.data.account_name,
        email: response.data.data.user_email,
      },
    });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    tokenManager.removeToken();
    set({ user: null });
    throw error;
  } finally {
    if (setLoading) setLoading(false);
  }
};

// Internal Zustand store - exported for use in loaders
export const useAuthStoreInternal = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      getCurrentUser: async (setLoading) => {
        await fetchUserData(set, setLoading);
      },
      clearUser: () => {
        set({ user: null });
        tokenManager.removeToken();
      },
      register: async (userData, setLoading) => {
        const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
          API_ENDPOINTS.AUTH.REGISTER,
          {
            user_email: userData.email,
            account_name: userData.name,
            user_password: userData.password,
          }
        );

        // Store token on successful registration
        if (response.data.data) {
          tokenManager.setToken(response.data.data.access_token);
          await fetchUserData(set, setLoading);
        }
      },
      login: async (credentials, setLoading) => {
        const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
          API_ENDPOINTS.AUTH.LOGIN,
          {
            user_email: credentials.email,
            user_password: credentials.password,
            remember_me: credentials.rememberMe ?? false,
          }
        );

        // Store token on successful login
        if (response.data.data) {
          const rememberMe = credentials.rememberMe ?? false;
          tokenManager.setToken(response.data.data.access_token, rememberMe);

          // Store refresh token if available and rememberMe is true
          if (response.data.data.refresh_token && rememberMe) {
            tokenManager.setRefreshToken(response.data.data.refresh_token);
          }

          await fetchUserData(set, setLoading);
        }
      },
      logout: async () => {
        // Revoke refresh token if exists
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          try {
            await apiClient.post(API_ENDPOINTS.AUTH.REVOKE, {
              refresh_token: refreshToken,
            });
          } catch (error) {
            // Log error but don't block logout
            console.error("Failed to revoke refresh token:", error);
          }
        }

        // Clear user and tokens
        set({ user: null });
        tokenManager.removeToken();
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Single unified hook
export const useAuth = () => {
  const { user, getCurrentUser, register, login, logout } =
    useAuthStoreInternal.getState();

  return {
    user,
    register,
    login,
    logout,
    getCurrentUser,
  };
};
