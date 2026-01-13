import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, tokenManager } from "@/lib";
import type { ApiSuccessResponse } from "@/types";
import type {
  RegisterFormData,
  LoginFormData,
  UpdateUserFormData,
  ChangePasswordFormData,
  AuthResponse,
  User,
} from "../types";
import { AuthMapper } from "../utils";
import {
  ENDPOINTS,
  ME_ENDPOINTS,
  STORAGE_KEYS as AUTH_STORAGE_KEYS,
} from "../constants";

interface AuthState {
  user: User | null;
  getCurrentUser: (setLoading?: (loading: boolean) => void) => Promise<void>;
  clearUser: () => void;
  register: (
    formData: RegisterFormData,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>;
  login: (
    formData: LoginFormData,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUserInfo: (
    formData: UpdateUserFormData,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>;
  changePassword: (
    formData: ChangePasswordFormData,
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
      ME_ENDPOINTS.GET
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
      register: async (formData, setLoading) => {
        // Convert UI form data to API payload using mapper
        const payload = AuthMapper.toRegisterPayload(formData);

        const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
          ENDPOINTS.REGISTER,
          payload
        );

        // Store token on successful registration
        // Response data is already converted to camelCase by interceptor
        if (response.data.data) {
          tokenManager.setToken(response.data.data.accessToken);
          await fetchUserData(set, setLoading);
        }
      },
      login: async (formData, setLoading) => {
        // Convert UI form data to API payload using mapper
        const payload = AuthMapper.toLoginPayload(formData);

        const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
          ENDPOINTS.LOGIN,
          payload
        );

        // Store token on successful login
        // Response data is already converted to camelCase by interceptor
        if (response.data.data) {
          const rememberMe = formData.rememberMe ?? false;
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
            // Convert to API payload using mapper
            const payload = AuthMapper.toRevokeTokenPayload(refreshToken);
            await apiClient.post(ENDPOINTS.REVOKE, payload);
          } catch (error) {
            // Log error but don't block logout
            console.error("Failed to revoke refresh token:", error);
          }
        }

        // Clear user and tokens
        set({ user: null });
        tokenManager.removeToken();
      },
      updateUserInfo: async (formData, setLoading) => {
        if (setLoading) setLoading(true);
        try {
          // Convert UI form data to API payload using mapper
          const payload = AuthMapper.toUpdateUserPayload(formData);

          const response = await apiClient.put<ApiSuccessResponse<User>>(
            ME_ENDPOINTS.UPDATE,
            payload
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
      changePassword: async (formData, setLoading) => {
        if (setLoading) setLoading(true);
        try {
          // Convert UI form data to API payload using mapper
          const payload = AuthMapper.toChangePasswordPayload(formData);

          await apiClient.put(ME_ENDPOINTS.CHANGE_PASSWORD, payload);
        } catch (error) {
          console.error("Failed to change password:", error);
          throw error;
        } finally {
          if (setLoading) setLoading(false);
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEYS.AUTH,
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

// Re-export types for external use
export type {
  RegisterFormData,
  LoginFormData,
  UpdateUserFormData,
  ChangePasswordFormData,
  User,
  AuthResponse,
} from "../types";
