import { create } from "zustand";
import type {
  DashboardProps,
  CategoryWithSetsProps,
  ApiSuccessResponse,
} from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";
import { useCategoriesStore } from "./useCategories";
import { useQuestionSetsStore } from "./useQuestionSets";

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
    // Get categories list from useCategoriesStore
    const { getCategories } = useCategoriesStore.getState();
    await getCategories();
    const { categories } = useCategoriesStore.getState();

    // Get question sets for each category from useQuestionSetsStore
    const { getQuestionSetsByCategory } = useQuestionSetsStore.getState();
    const categoriesWithSetsPromises = categories.map(async (category) => {
      const questionSets = await getQuestionSetsByCategory(category.id);
      const totalQuestions = questionSets.reduce(
        (sum, set) => sum + (set.question_count || 0),
        0
      );

      return {
        category: category.name,
        total_questions: totalQuestions,
        question_sets: questionSets,
      } as CategoryWithSetsProps;
    });

    const categoriesWithSets = await Promise.all(categoriesWithSetsPromises);
    set({ categoriesWithSets });
  },
}));
