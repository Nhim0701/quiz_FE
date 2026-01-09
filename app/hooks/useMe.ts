import { create } from "zustand";
import type { ApiSuccessResponse } from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";

export interface OverallStatsProps {
  total_answered: number;
  total_correct: number;
  total_wrong: number;
  overall_accuracy: number;
}

export interface ByCategoryStatsProps {
  category: string;
  total_answered: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy: number;
  last_attempt: string | null;
}

export interface ByTestStatsProps {
  test_id: string;
  test_name: string;
  total_answered: number;
  total_submitted: number;
  correct_answers: number;
  correct_submissions: number;
  wrong_answers: number;
  wrong_submissions: number;
  accuracy: number;
  last_attempt: string | null;
}

export interface RecentActivityStatsProps {
  id: number;
  category: string;
  test_name: string;
  question_preview: string;
  is_correct: boolean;
  answered_at: number | null;
}

export interface DashboardProps {
  overall: OverallStatsProps;
  by_category: ByCategoryStatsProps[];
  by_test: Record<string, ByTestStatsProps[]>;
  recent_activity: RecentActivityStatsProps[];
}

interface MeState {
  // Dashboard data
  dashboardData: DashboardProps | null;

  // API methods
  getDashboard: () => Promise<void>;
}

export const useMe = create<MeState>((set) => ({
  // Initial state
  dashboardData: null,

  // API methods
  getDashboard: async () => {
    const response = await apiClient.get<ApiSuccessResponse<DashboardProps>>(
      API_ENDPOINTS.ME.DASHBOARD
    );
    set({ dashboardData: response.data.data });
  },
}));
