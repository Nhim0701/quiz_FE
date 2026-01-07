import { create } from "zustand";
import { QuestionProps, CategoryWithSetsProps } from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";

interface QuestionsState {
  // Categories with question sets
  categoriesWithSets: CategoryWithSetsProps[];
  setCategoriesWithSets: (categories: CategoryWithSetsProps[]) => void;

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
  getCategories: <T>() => Promise<T>;
  getCategoriesWithSets: <T>() => Promise<T>;
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

  // Categories with sets
  setCategoriesWithSets: (categories) => set({ categoriesWithSets: categories }),

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
  getCategories: async <T>(): Promise<T> => {
    const response = await apiClient.get<T>(API_ENDPOINTS.QUESTIONS.CATEGORIES);
    return response.data;
  },

  getCategoriesWithSets: async <T>(): Promise<T> => {
    const response = await apiClient.get<T>(
      API_ENDPOINTS.QUESTIONS.CATEGORIES_WITH_SETS
    );
    return response.data;
  },

  getQuestionsByCategory: async <T>(category: string): Promise<T> => {
    const response = await apiClient.get<T>(
      API_ENDPOINTS.QUESTIONS.BY_CATEGORY(category)
    );
    return response.data;
  },

  getQuestionsByCategoryAndSet: async <T>(
    category: string,
    questionSet: string
  ): Promise<T> => {
    const response = await apiClient.get<T>(
      API_ENDPOINTS.QUESTIONS.BY_CATEGORY_AND_SET(category, questionSet)
    );
    return response.data;
  },
}));

