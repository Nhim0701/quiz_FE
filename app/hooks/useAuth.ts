import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/axios";
import { tokenManager } from "@/lib/api";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/constants";
import type { ApiSuccessResponse } from "@/types";

interface UserData {
  email: string;
  fullName: string;
  password: string;
}

interface Credentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  refreshToken?: string;
}

export interface User {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  birthday?: string;
  address?: string;
  jobTitle?: string;
  company?: string;
  joinDate?: string;
}

interface UpdateUserData {
  userId?: string;
  fullName?: string;
  phone?: string;
  birthday?: string;
  address?: string;
  jobTitle?: string;
  company?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
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
  updateUserInfo: (
    userData: UpdateUserData,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>;
  changePassword: (
    passwordData: ChangePasswordData,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>;
}

// Helper function to fetch user data
const fetchUserData = async (
  set: (state: Partial<AuthState>) => void,
  setLoading?: (loading: boolean) => void
): Promise<void> => {
  if (setLoading) setLoading(true);
  try {
    const response = await apiClient.get<ApiSuccessResponse<User>>(
      API_ENDPOINTS.ME.GET
    );
    // Data is already converted to camelCase by axios interceptor
    set({ user: response.data.data });
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
            // Request data in camelCase - will be converted to snake_case by interceptor
            email: userData.email,
            fullName: userData.fullName,
            password: userData.password,
          }
        );

        // Store token on successful registration
        // Response data is already converted to camelCase by interceptor
        if (response.data.data) {
          tokenManager.setToken(response.data.data.accessToken);
          await fetchUserData(set, setLoading);
        }
      },
      login: async (credentials, setLoading) => {
        const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
          API_ENDPOINTS.AUTH.LOGIN,
          {
            // Request data in camelCase - will be converted to snake_case by interceptor
            email: credentials.email,
            password: credentials.password,
            rememberMe: credentials.rememberMe ?? false,
          }
        );

        // Store token on successful login
        // Response data is already converted to camelCase by interceptor
        if (response.data.data) {
          const rememberMe = credentials.rememberMe ?? false;
          tokenManager.setToken(response.data.data.accessToken, rememberMe);

          // Store refresh token if available and rememberMe is true
          if (response.data.data.refreshToken && rememberMe) {
            tokenManager.setRefreshToken(response.data.data.refreshToken);
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
              // Request data in camelCase - will be converted to snake_case by interceptor
              refreshToken: refreshToken,
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
      updateUserInfo: async (userData, setLoading) => {
        if (setLoading) setLoading(true);
        try {
          const response = await apiClient.put<ApiSuccessResponse<User>>(
            API_ENDPOINTS.ME.UPDATE,
            {
              // Request data in camelCase - will be converted to snake_case by interceptor
              userId: userData.userId,
              fullName: userData.fullName,
              phone: userData.phone,
              birthday: userData.birthday,
              address: userData.address,
              jobTitle: userData.jobTitle,
              company: userData.company,
            }
          );
          // Update user in store
          set({ user: response.data.data });
        } catch (error) {
          console.error("Failed to update user info:", error);
          throw error;
        } finally {
          if (setLoading) setLoading(false);
        }
      },
      changePassword: async (passwordData, setLoading) => {
        if (setLoading) setLoading(true);
        try {
          await apiClient.put(API_ENDPOINTS.ME.CHANGE_PASSWORD, {
            // Request data in camelCase - will be converted to snake_case by interceptor
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          });
        } catch (error) {
          console.error("Failed to change password:", error);
          throw error;
        } finally {
          if (setLoading) setLoading(false);
        }
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
  const {
    user,
    getCurrentUser,
    register,
    login,
    logout,
    updateUserInfo,
    changePassword,
  } = useAuthStoreInternal.getState();

  return {
    user,
    register,
    login,
    logout,
    getCurrentUser,
    updateUserInfo,
    changePassword,
  };
};
