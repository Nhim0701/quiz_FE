import { create } from "zustand";
import {
  QuestionProps,
  CategoryWithSetsProps,
  ApiSuccessResponse,
} from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";

interface QuestionsState {
  // Categories with question sets
  categoriesWithSets: CategoryWithSetsProps[];

  // Cached questions by category and set
  cachedQuestions: Record<string, QuestionProps[]>; // key: "category:set" or "category"
  setCachedQuestions: (
    category: string,
    questionSet: string | null,
    questions: QuestionProps[]
  ) => void;
  getCachedQuestions: (
    category: string,
    questionSet: string | null
  ) => QuestionProps[] | null;

  // Clear cache
  clearCache: () => void;

  // API methods
  getCategoriesWithSets: () => Promise<void>;
  getQuestionsByCategory: <T>(category: string) => Promise<T>;
  getQuestionsByCategoryAndSet: <T>(
    category: string,
    questionSet: string
  ) => Promise<T>;
}

export const useQuestionsStore = create<QuestionsState>((set, get) => ({
  // Initial state
  categoriesWithSets: [],
  cachedQuestions: {},

  // Cache management
  setCachedQuestions: (category, questionSet, questions) => {
    const { cachedQuestions } = get();
    const key = questionSet ? `${category}:${questionSet}` : category;
    set({
      cachedQuestions: {
        ...cachedQuestions,
        [key]: questions,
      },
    });
  },

  getCachedQuestions: (category, questionSet) => {
    const { cachedQuestions } = get();
    const key = questionSet ? `${category}:${questionSet}` : category;
    return cachedQuestions[key] || null;
  },

  clearCache: () => set({ cachedQuestions: {} }),

  // API methods
  getCategoriesWithSets: async () => {
    const response = await apiClient.get<
      ApiSuccessResponse<CategoryWithSetsProps[]>
    >(API_ENDPOINTS.QUESTIONS.CATEGORIES_WITH_SETS);
    set({ categoriesWithSets: response.data.data });
  },

  getQuestionsByCategory: async <T>(category: string): Promise<T> => {
    const response = await apiClient.get<ApiSuccessResponse<T>>(
      API_ENDPOINTS.QUESTIONS.BY_CATEGORY(category)
    );
    return response.data.data;
  },

  getQuestionsByCategoryAndSet: async <T>(
    category: string,
    questionSet: string
  ): Promise<T> => {
    const response = await apiClient.get<ApiSuccessResponse<T>>(
      API_ENDPOINTS.QUESTIONS.BY_CATEGORY_AND_SET(category, questionSet)
    );
    return response.data.data;
  },
}));
