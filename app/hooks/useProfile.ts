import { create } from "zustand";
import type { DashboardProps, ApiSuccessResponse } from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";

interface ProfileState {
  // Dashboard data
  dashboardData: DashboardProps | null;

  // API methods
  getDashboard: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  // Initial state
  dashboardData: null,

  // API methods
  getDashboard: async () => {
    const response = await apiClient.get<ApiSuccessResponse<DashboardProps>>(
      API_ENDPOINTS.RESPONSES.DASHBOARD
    );
    set({ dashboardData: response.data.data });
  },
}));
