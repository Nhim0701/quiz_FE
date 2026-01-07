import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/axios";
import { tokenManager } from "@/lib/api";

interface UserData {
  email: string;
  name: string;
  password: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

interface User {
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
  setUser: (user: User | null) => void;
  getCurrentUser: (setLoading?: (loading: boolean) => void) => Promise<void>;
  clearUser: () => void;
  register: (userData: UserData, setLoading?: (loading: boolean) => void) => Promise<AuthResponse>;
  login: (credentials: Credentials, setLoading?: (loading: boolean) => void) => Promise<AuthResponse>;
  logout: () => void;
}

// Helper function to fetch user data
const fetchUserData = async (
  set: (state: Partial<AuthState>) => void,
  setLoading?: (loading: boolean) => void
): Promise<void> => {
  if (setLoading) setLoading(true);
  try {
    const response = await apiClient.get<UserResponse>("/api/v1/users/me");
    set({
      user: {
        name: response.data.account_name,
        email: response.data.user_email,
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
      setUser: (user) => set({ user }),
      getCurrentUser: async (setLoading) => {
        await fetchUserData(set, setLoading);
      },
      clearUser: () => {
        set({ user: null });
        tokenManager.removeToken();
      },
      register: async (userData, setLoading) => {
        const response = await apiClient.post<AuthResponse>(
          "/api/v1/auth/register",
          {
            user_email: userData.email,
            account_name: userData.name,
            user_password: userData.password,
          }
        );

        // Store token on successful registration
        if (response.data.access_token) {
          tokenManager.setToken(response.data.access_token);
          await fetchUserData(set, setLoading);
        }

        return response.data;
      },
      login: async (credentials, setLoading) => {
        const response = await apiClient.post<AuthResponse>(
          "/api/v1/auth/login",
          {
            user_email: credentials.email,
            user_password: credentials.password,
          }
        );

        // Store token on successful login
        if (response.data.access_token) {
          tokenManager.setToken(response.data.access_token);
          await fetchUserData(set, setLoading);
        }

        return response.data;
      },
      logout: () => {
        set({ user: null });
        tokenManager.removeToken();
      },
    }),
    {
      name: "auth-storage",
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
