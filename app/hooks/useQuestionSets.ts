import { create } from "zustand";
import type { ApiSuccessResponse } from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";

export interface QuestionSetProps {
  id: string;
  name: string;
  question_count: number;
  category_id: string;
}

interface QuestionSetsState {
  // Question sets by category ID
  questionSetsByCategory: Record<number, QuestionSetProps[]>;
  loading: Record<number, boolean>;
  error: Record<number, string | null>;

  // API methods
  getQuestionSetsByCategory: (
    categoryId: number
  ) => Promise<QuestionSetProps[]>;
  clearQuestionSetsByCategory: (categoryId?: number) => void;
}

export const useQuestionSetsStore = create<QuestionSetsState>((set, get) => ({
  // Initial state
  questionSetsByCategory: {},
  loading: {},
  error: {},

  // API methods
  getQuestionSetsByCategory: async (categoryId: number) => {
    const { questionSetsByCategory } = get();

    // Return cached data if available
    if (questionSetsByCategory[categoryId]) {
      return questionSetsByCategory[categoryId];
    }

    set((state) => ({
      loading: { ...state.loading, [categoryId]: true },
      error: { ...state.error, [categoryId]: null },
    }));

    try {
      const response = await apiClient.get<
        ApiSuccessResponse<Array<QuestionSetProps>>
      >(API_ENDPOINTS.CATEGORIES.QUESTION_SETS(categoryId));

      const questionSets = response.data.data || [];

      set((state) => ({
        questionSetsByCategory: {
          ...state.questionSetsByCategory,
          [categoryId]: questionSets,
        },
        loading: { ...state.loading, [categoryId]: false },
      }));

      return questionSets;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch question sets";
      set((state) => ({
        error: { ...state.error, [categoryId]: errorMessage },
        loading: { ...state.loading, [categoryId]: false },
      }));
      throw error;
    }
  },

  clearQuestionSetsByCategory: (categoryId?: number) => {
    if (categoryId) {
      set((state) => {
        const newQuestionSets = { ...state.questionSetsByCategory };
        const newLoading = { ...state.loading };
        const newError = { ...state.error };
        delete newQuestionSets[categoryId];
        delete newLoading[categoryId];
        delete newError[categoryId];
        return {
          questionSetsByCategory: newQuestionSets,
          loading: newLoading,
          error: newError,
        };
      });
    } else {
      set({
        questionSetsByCategory: {},
        loading: {},
        error: {},
      });
    }
  },
}));
