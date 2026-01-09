import { create } from "zustand";
import type { ApiSuccessResponse } from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";

export interface OverallStatsProps {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  overallAccuracy: number;
}

export interface ByCategoryStatsProps {
  category: string;
  totalAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  lastAttempt: string | null;
}

export interface ByTestStatsProps {
  testId: string;
  testName: string;
  totalAnswered: number;
  totalSubmitted: number;
  correctAnswers: number;
  correctSubmissions: number;
  wrongAnswers: number;
  wrongSubmissions: number;
  accuracy: number;
  lastAttempt: string | null;
}

export interface RecentActivityStatsProps {
  id: number;
  category: string;
  testName: string;
  questionPreview: string;
  isCorrect: boolean;
  answeredAt: number | null;
}

export interface DashboardProps {
  overall: OverallStatsProps;
  byCategory: ByCategoryStatsProps[];
  byTest: Record<string, ByTestStatsProps[]>;
  recentActivity: RecentActivityStatsProps[];
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
