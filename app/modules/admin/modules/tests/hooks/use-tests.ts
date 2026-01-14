import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS, ERROR_MESSAGES, DEFAULT_VALUES } from "../constants";
import { ENDPOINTS as QUESTIONS_ENDPOINTS } from "../../questions/constants";
import type { TestProps } from "../types";
import type { QuestionProps } from "../../questions/types";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES, FILTER_QUERY_PARAMS } from "@/constants";
import { PAGINATION } from "@/constants";
import { t } from "@/i18n/utils";

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

  // Questions state and methods (merged from useQuestionsStore)
  questions: QuestionProps[];
  questionsLoading: boolean;
  questionsError: string | null;
  questionsTotal: number;
  questionsMeta?: ApiResponseMeta;
  isQuestionsDialogOpen: boolean;
  openQuestionsDialog: () => void;
  closeQuestionsDialog: () => void;
  fetchQuestions: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
  createQuestion: (data: {
    testId: string;
    content: string;
    isMultipleChoice: boolean;
    categoryId?: string;
  }) => Promise<QuestionProps>;
  updateQuestion: (
    testId: string,
    questionId: string,
    data: {
      content: string;
      isMultipleChoice: boolean;
      testId?: string;
      categoryId?: string;
    }
  ) => Promise<QuestionProps>;
  getQuestion: (testId: string, questionId: string) => Promise<QuestionProps>;
  deleteQuestion: (
    testId: string,
    questionId: string,
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
  refreshQuestions: (
    testId: string,
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

  // Questions initial state
  questions: [],
  questionsLoading: false,
  questionsError: null,
  questionsTotal: 0,
  questionsMeta: undefined,
  isQuestionsDialogOpen: false,

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
      const params: Record<string, any> = {
        page: 1,
        pageSize: PAGINATION.MAX_PAGE_SIZE_FOR_ALL,
        [FILTER_QUERY_PARAMS.FILTER_KEY(1)]: "category_id",
        [FILTER_QUERY_PARAMS.FILTER_VALUE(1)]: categoryId,
      };

      const response = await apiClient.get<
        ApiSuccessResponse<Array<TestProps>>
      >(ENDPOINTS.LIST, { params });

      const tests = response.data.data || [];

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
      const response = await apiClient.get<ApiSuccessResponse<TestProps>>(
        ENDPOINTS.GET(testId)
      );

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
      const params: Record<string, any> = {
        page,
        pageSize,
      };

      // Add filter params if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && typeof value === "string" && value.trim()) {
            params[key] = value;
          }
        });
      }

      const response = await apiClient.get<ApiSuccessResponse<TestProps[]>>(
        ENDPOINTS.LIST,
        {
          params,
        }
      );

      const data = response.data.data || [];
      const meta = response.data.meta;

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
      const response = await apiClient.post<ApiSuccessResponse<TestProps>>(
        ENDPOINTS.CREATE,
        data
      );
      set({ loading: false });
      return response.data.data;
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
      const response = await apiClient.put<ApiSuccessResponse<TestProps>>(
        ENDPOINTS.UPDATE(id),
        data
      );
      const updatedTest = response.data.data;

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
      await apiClient.delete(ENDPOINTS.DELETE(id));
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

  // Questions dialog actions
  openQuestionsDialog: () => set({ isQuestionsDialogOpen: true }),
  closeQuestionsDialog: () => set({ isQuestionsDialogOpen: false }),

  // Questions API methods
  fetchQuestions: async (
    page = 1,
    pageSize = 10,
    filters?: Record<string, string>
  ) => {
    set({ questionsLoading: true, questionsError: null });
    try {
      const params: Record<string, any> = {
        page,
        pageSize,
      };

      // Add filter params if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && typeof value === "string" && value.trim()) {
            params[key] = value;
          }
        });
      }

      const response = await apiClient.get<ApiSuccessResponse<QuestionProps[]>>(
        QUESTIONS_ENDPOINTS.QUESTIONS.LIST,
        {
          params,
        }
      );
      set({
        questions: response.data.data || [],
        questionsLoading: false,
        questionsTotal:
          response.data.meta?.total || response.data.data?.length || 0,
        questionsMeta: response.data.meta,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t(ERROR_MESSAGES.FETCH_FAILED);
      set({
        questionsError: errorMessage,
        questionsLoading: false,
        questions: [],
        questionsTotal: 0,
      });
      throw error;
    }
  },

  createQuestion: async (data: {
    testId: string;
    content: string;
    isMultipleChoice: boolean;
    categoryId?: string;
  }) => {
    set({ questionsLoading: true, questionsError: null });
    try {
      const response = await apiClient.post<ApiSuccessResponse<QuestionProps>>(
        QUESTIONS_ENDPOINTS.QUESTIONS.CREATE,
        data
      );
      set({ questionsLoading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.CREATE_FAILED);
      set({ questionsError: errorMessage, questionsLoading: false });
      throw error;
    }
  },

  updateQuestion: async (
    testId: string,
    questionId: string,
    data: {
      content: string;
      isMultipleChoice: boolean;
      testId?: string;
      categoryId?: string;
    }
  ) => {
    set({ questionsLoading: true, questionsError: null });
    try {
      const response = await apiClient.put<ApiSuccessResponse<QuestionProps>>(
        QUESTIONS_ENDPOINTS.QUESTIONS.UPDATE(questionId),
        data
      );
      set({ questionsLoading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.UPDATE_FAILED);
      set({ questionsError: errorMessage, questionsLoading: false });
      throw error;
    }
  },

  getQuestion: async (testId: string, questionId: string) => {
    set({ questionsLoading: true, questionsError: null });
    try {
      const response = await apiClient.get<ApiSuccessResponse<QuestionProps>>(
        QUESTIONS_ENDPOINTS.QUESTIONS.GET(questionId)
      );
      set({ questionsLoading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t(ERROR_MESSAGES.FETCH_FAILED);
      set({ questionsError: errorMessage, questionsLoading: false });
      throw error;
    }
  },

  deleteQuestion: async (
    testId: string,
    questionId: string,
    page = 1,
    pageSize = 10,
    filters?: Record<string, string>
  ) => {
    set({ questionsLoading: true, questionsError: null });
    try {
      await apiClient.delete(QUESTIONS_ENDPOINTS.QUESTIONS.DELETE(questionId));
      // Refresh questions after delete
      await get().fetchQuestions(page, pageSize, filters);
      set({ questionsLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete question";
      set({ questionsError: errorMessage, questionsLoading: false });
      throw error;
    }
  },

  refreshQuestions: async (
    testId: string,
    page = 1,
    pageSize = 10,
    filters?: Record<string, string>
  ) => {
    await get().fetchQuestions(page, pageSize, filters);
  },
}));
