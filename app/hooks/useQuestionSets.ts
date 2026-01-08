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
  questionSetsByCategory: Record<string, QuestionSetProps[]>;
  // Question sets by ID cache
  questionSetsById: Record<string, QuestionSetProps>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;

  // API methods
  getQuestionSetsByCategory: (
    categoryId: string
  ) => Promise<QuestionSetProps[]>;
  getQuestionSetById: (
    questionSetId: string
  ) => Promise<QuestionSetProps | null>;
}

export const useQuestionSetsStore = create<QuestionSetsState>((set, get) => ({
  // Initial state
  questionSetsByCategory: {},
  questionSetsById: {},
  loading: {},
  error: {},

  // API methods
  getQuestionSetsByCategory: async (categoryId: string) => {
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

  getQuestionSetById: async (questionSetId: string) => {
    const { questionSetsByCategory, questionSetsById } = get();

    // Check cache by ID first
    if (questionSetsById[questionSetId]) {
      return questionSetsById[questionSetId];
    }

    // Search through all categories to find the question set
    for (const questionSets of Object.values(questionSetsByCategory)) {
      const found = questionSets.find((set) => set.id === questionSetId);
      if (found) {
        // Cache it
        set((state) => ({
          questionSetsById: {
            ...state.questionSetsById,
            [questionSetId]: found,
          },
        }));
        return found;
      }
    }

    // If not found in cache, fetch from API
    try {
      const response = await apiClient.get<
        ApiSuccessResponse<QuestionSetProps>
      >(API_ENDPOINTS.QUESTION_SETS.GET(questionSetId));

      const questionSet = response.data.data;

      if (questionSet) {
        // Cache it
        set((state) => ({
          questionSetsById: {
            ...state.questionSetsById,
            [questionSetId]: questionSet,
          },
        }));

        // Also add to category cache if we have category_id
        if (questionSet.category_id) {
          const categoryId = parseInt(questionSet.category_id);
          if (!isNaN(categoryId)) {
            set((state) => {
              const categorySets =
                state.questionSetsByCategory[categoryId] || [];
              const exists = categorySets.some(
                (set) => set.id === questionSetId
              );
              if (!exists) {
                return {
                  questionSetsByCategory: {
                    ...state.questionSetsByCategory,
                    [categoryId]: [...categorySets, questionSet],
                  },
                };
              }
              return state;
            });
          }
        }

        return questionSet;
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch question set:", error);
      return null;
    }
  },
}));
