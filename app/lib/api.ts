// API utility for backend communication
import { STORAGE_KEYS } from "@/constants";

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    return (
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    );
  },
  setToken: (token: string, rememberMe: boolean = false): void => {
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  setRefreshToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },
  removeToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  hasToken: (): boolean => {
    return !!(
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    );
  },
};

