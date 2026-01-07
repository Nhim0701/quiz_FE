import { create } from "zustand";
import type {
  DashboardProps,
  CategoryWithSetsProps,
  ApiSuccessResponse,
} from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";

interface ProfileState {
  // Dashboard data
  dashboardData: DashboardProps | null;

  // Categories with sets (also in questions store, but kept here for profile)
  categoriesWithSets: CategoryWithSetsProps[];

  // API methods
  getDashboard: () => Promise<void>;
  getCategoriesWithSets: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  // Initial state
  dashboardData: null,
  categoriesWithSets: [],

  // API methods
  getDashboard: async () => {
    const response = await apiClient.get<ApiSuccessResponse<DashboardProps>>(
      API_ENDPOINTS.RESPONSES.DASHBOARD
    );
    set({ dashboardData: response.data.data });
  },

  getCategoriesWithSets: async () => {
    const response = await apiClient.get<
      ApiSuccessResponse<CategoryWithSetsProps[]>
    >(API_ENDPOINTS.QUESTIONS.CATEGORIES_WITH_SETS);
    set({ categoriesWithSets: response.data.data });
  },
}));
