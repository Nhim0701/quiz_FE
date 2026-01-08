import { create } from "zustand";
import type {
  QuestionProps,
  CategoryWithSetsProps,
  ApiSuccessResponse,
} from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";
import { useCategoriesStore } from "./useCategories";
import { useQuestionSetsStore } from "./useQuestionSets";

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
