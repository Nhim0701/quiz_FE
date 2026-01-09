import { create } from "zustand";
import type { ApiSuccessResponse } from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";

export interface TestProps {
  id: string;
  name: string;
  questionCount: number;
  categoryId: string;
}

interface TestsState {
  // Tests by category ID
  testsByCategory: Record<string, TestProps[]>;
  // Tests by ID cache
  testsById: Record<string, TestProps>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;

  // API methods
  getTestsByCategory: (
    categoryId: string
  ) => Promise<TestProps[]>;
  getTestById: (
    testId: string
  ) => Promise<TestProps | null>;
}

export const useTestsStore = create<TestsState>((set, get) => ({
  // Initial state
  testsByCategory: {},
  testsById: {},
  loading: {},
  error: {},

  // API methods
  getTestsByCategory: async (categoryId: string) => {
    const { testsByCategory } = get();

    // Return cached data if available
    if (testsByCategory[categoryId]) {
      return testsByCategory[categoryId];
    }

    set((state) => ({
      loading: { ...state.loading, [categoryId]: true },
      error: { ...state.error, [categoryId]: null },
    }));

    try {
      const response = await apiClient.get<
        ApiSuccessResponse<Array<TestProps>>
      >(API_ENDPOINTS.CATEGORIES.TESTS(categoryId));

      const tests = response.data.data || [];

      set((state) => ({
        testsByCategory: {
          ...state.testsByCategory,
          [categoryId]: tests,
        },
        loading: { ...state.loading, [categoryId]: false },
      }));

      return tests;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch tests";
      set((state) => ({
        error: { ...state.error, [categoryId]: errorMessage },
        loading: { ...state.loading, [categoryId]: false },
      }));
      throw error;
    }
  },

  getTestById: async (testId: string) => {
    const { testsByCategory, testsById } = get();

    // Check cache by ID first
    if (testsById[testId]) {
      return testsById[testId];
    }

    // Search through all categories to find the test
    for (const tests of Object.values(testsByCategory)) {
      const found = tests.find((test) => test.id === testId);
      if (found) {
        // Cache it
        set((state) => ({
          testsById: {
            ...state.testsById,
            [testId]: found,
          },
        }));
        return found;
      }
    }

    // If not found in cache, fetch from API
    try {
      const response = await apiClient.get<
        ApiSuccessResponse<TestProps>
      >(API_ENDPOINTS.TESTS.GET(testId));

      const test = response.data.data;

      if (test) {
        // Cache it
        set((state) => ({
          testsById: {
            ...state.testsById,
            [testId]: test,
          },
        }));

        // Also add to category cache if we have categoryId
        if (test.categoryId) {
          const categoryId = parseInt(test.categoryId);
          if (!isNaN(categoryId)) {
            set((state) => {
              const categoryTests =
                state.testsByCategory[categoryId] || [];
              const exists = categoryTests.some(
                (test) => test.id === testId
              );
              if (!exists) {
                return {
                  testsByCategory: {
                    ...state.testsByCategory,
                    [categoryId]: [...categoryTests, test],
                  },
                };
              }
              return state;
            });
          }
        }

        return test;
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch test:", error);
      return null;
    }
  },
}));
