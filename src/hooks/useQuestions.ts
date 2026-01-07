import { create } from "zustand";
import { QuestionProps, CategoryWithSetsProps } from "@/types";

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
}));

