import { create } from "zustand";
import type { ApiSuccessResponse } from "@/types";
import { apiClient } from "@/lib";
import { DASHBOARD_API_ENDPOINTS } from "../constants";
import type { DashboardProps } from "../types";

interface DashboardState {
  // Dashboard data
  dashboardData: DashboardProps | null;

  // API methods
  getDashboard: () => Promise<void>;
}

export const useDashboard = create<DashboardState>((set) => ({
  // Initial state
  dashboardData: null,

  // API methods
  getDashboard: async () => {
    const response = await apiClient.get<ApiSuccessResponse<DashboardProps>>(
      DASHBOARD_API_ENDPOINTS.DASHBOARD
    );
    set({ dashboardData: response.data.data });
  },
}));
