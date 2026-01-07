import { create } from "zustand";
import { DashboardProps, CategoryWithSetsProps } from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";

interface ProfileState {
  // Dashboard data
  dashboardData: DashboardProps | null;
  setDashboardData: (data: DashboardProps | null) => void;

  // Categories with sets (also in questions store, but kept here for profile)
  categoriesWithSets: CategoryWithSetsProps[];
  setCategoriesWithSets: (categories: CategoryWithSetsProps[]) => void;

  // Loading state
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // API methods
  getDashboard: <T>() => Promise<T>;

  // Refresh dashboard data
  refreshDashboard: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  // Initial state
  dashboardData: null,
  categoriesWithSets: [],
  loading: false,

  // Dashboard data
  setDashboardData: (data) => set({ dashboardData: data }),

  // Categories with sets
  setCategoriesWithSets: (categories) => set({ categoriesWithSets: categories }),

  // Loading
  setLoading: (loading) => set({ loading }),

  // API methods
  getDashboard: async <T>(): Promise<T> => {
    const response = await apiClient.get<T>(API_ENDPOINTS.RESPONSES.DASHBOARD);
    return response.data;
  },

  // Refresh dashboard (placeholder - will be implemented with API call)
  refreshDashboard: async () => {
    // This will be implemented in the component that uses the store
    // to avoid circular dependencies with API utilities
  },
}));

