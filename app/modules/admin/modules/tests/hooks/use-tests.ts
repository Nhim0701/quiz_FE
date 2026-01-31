import { create } from "zustand";
import { ERROR_MESSAGES, DEFAULT_VALUES } from "../constants";
import type { TestProps } from "../types";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";
import { PAGINATION } from "@/constants";
import { t } from "@/i18n/utils";
import { testsService } from "../services/tests.service";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";

interface TestsState {
  // Tests by category ID
  testsByCategory: Record<string, TestProps[]>;
  // Tests by ID cache
  testsById: Record<string, TestProps>;
  categoryLoading: Record<string, boolean>;
  categoryError: Record<string, string | null>;

  // Admin tests list state
  tests: TestProps[];
  loading: boolean;
  error: string | null;

  // Form state
  isDialogOpen: boolean;
  dialogMode: FormDialogMode | null;
  test: TestProps | null;
  isEditMode: boolean;

  // Actions
  openDialog: (mode: FormDialogMode, test?: TestProps | null) => void;
  closeDialog: () => void;
  setEditMode: (isEdit: boolean) => void;

  // API methods
  getTestsByCategory: (categoryId: string) => Promise<TestProps[]>;
  getTestById: (testId: string) => Promise<TestProps | null>;

  // Admin API methods
  fetchTests: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<{ data: TestProps[]; meta?: ApiResponseMeta } | undefined>;
  createTest: (data: {
    name: string;
    categoryId: string;
    description?: string;
    timeLimit: number;
  }) => Promise<TestProps>;
  updateTest: (
    id: string,
    data: {
      name: string;
      categoryId: string;
      description?: string;
      timeLimit: number;
    }
  ) => Promise<TestProps>;
  deleteTest: (id: string) => Promise<void>;
  refreshTests: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
}

export const useTestsStore = create<TestsState>((set, get) => ({
  // Initial state
  testsByCategory: {},
  testsById: {},
  categoryLoading: {},
  categoryError: {},
  tests: [],
  loading: false,
  error: null,
  isDialogOpen: false,
  dialogMode: null,
  test: null,
  isEditMode: false,

  // Form actions
  openDialog: (mode: FormDialogMode, test?: TestProps | null) => {
    set({
      isDialogOpen: true,
      dialogMode: mode,
      test: test ?? null,
      isEditMode: mode === DIALOG_MODES.EDIT,
    });
  },
  closeDialog: () => {
    set({
      isDialogOpen: false,
      dialogMode: null,
      test: null,
      isEditMode: false,
    });
  },
  setEditMode: (isEdit) => {
    set({ isEditMode: isEdit });
  },

  // API methods
  getTestsByCategory: async (categoryId: string) => {
    const { testsByCategory } = get();

    // Return cached data if available
    if (testsByCategory[categoryId]) {
      return testsByCategory[categoryId];
    }

    set((state) => ({
      categoryLoading: { ...state.categoryLoading, [categoryId]: true },
      categoryError: { ...state.categoryError, [categoryId]: null },
    }));

    try {
      const tests = await testsService.getTestsByCategory(
        categoryId,
        1,
        PAGINATION.MAX_PAGE_SIZE_FOR_ALL
      );

      set((state) => ({
        testsByCategory: {
          ...state.testsByCategory,
          [categoryId]: tests,
        },
        categoryLoading: { ...state.categoryLoading, [categoryId]: false },
      }));

      return tests;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t(ERROR_MESSAGES.FETCH_FAILED);
      set((state) => ({
        categoryError: { ...state.categoryError, [categoryId]: errorMessage },
        categoryLoading: { ...state.categoryLoading, [categoryId]: false },
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
      const test = await testsService.getTestById(testId);

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
              const categoryTests = state.testsByCategory[categoryId] || [];
              const exists = categoryTests.some((test) => test.id === testId);
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

  // Admin API methods
  fetchTests: async (
    page = DEFAULT_VALUES.PAGE,
    pageSize = DEFAULT_VALUES.PAGE_SIZE,
    filters?: Record<string, string>
  ) => {
    set({ loading: true, error: null });
    try {
      const { data, meta } = await testsService.fetchTests(
        page,
        pageSize,
        filters
      );

      set({
        tests: data,
        loading: false,
      });

      return { data, meta };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t(ERROR_MESSAGES.FETCH_FAILED);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createTest: async (data) => {
    set({ loading: true, error: null });
    try {
      const newTest = await testsService.createTest(data);
      set({ loading: false });
      return newTest;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.CREATE_FAILED);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateTest: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedTest = await testsService.updateTest(id, data);

      // Update cache
      set((state) => {
        const updatedTestsById = {
          ...state.testsById,
          [id]: updatedTest,
        };

        // Update in testsByCategory if exists
        const updatedTestsByCategory = { ...state.testsByCategory };
        if (updatedTest.categoryId) {
          const categoryId = parseInt(updatedTest.categoryId);
          if (!isNaN(categoryId) && updatedTestsByCategory[categoryId]) {
            updatedTestsByCategory[categoryId] = updatedTestsByCategory[
              categoryId
            ].map((test) => (test.id === id ? updatedTest : test));
          }
        }

        // Update in tests if exists
        const updatedTests = state.tests.map((test) =>
          test.id === id ? updatedTest : test
        );

        return {
          testsById: updatedTestsById,
          testsByCategory: updatedTestsByCategory,
          tests: updatedTests,
          loading: false,
        };
      });

      return updatedTest;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.UPDATE_FAILED);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteTest: async (id) => {
    set({ loading: true, error: null });
    try {
      await testsService.deleteTest(id);
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.DELETE_FAILED);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  refreshTests: async (
    page = DEFAULT_VALUES.PAGE,
    pageSize = DEFAULT_VALUES.PAGE_SIZE,
    filters?: Record<string, string>
  ) => {
    const { test, dialogMode } = get();
    await get().fetchTests(page, pageSize, filters);

    // Update test if it exists and dialog is still open
    if (test && dialogMode) {
      const { tests } = get();
      const updatedTest = tests.find((t) => t.id === test.id);
      if (updatedTest) {
        set({ test: updatedTest });
      }
    }
  },
}));
