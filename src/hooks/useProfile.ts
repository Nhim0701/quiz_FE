import { create } from "zustand";
import { DashboardProps, CategoryWithSetsProps } from "@/types";

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

  // Refresh dashboard (placeholder - will be implemented with API call)
  refreshDashboard: async () => {
    // This will be implemented in the component that uses the store
    // to avoid circular dependencies with API utilities
  },
}));

