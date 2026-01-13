import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";
import { ENDPOINTS as QUESTIONS_ENDPOINTS } from "../../questions/constants";
import { ENDPOINTS as CATEGORIES_ENDPOINTS } from "../../categories/constants";
import type { TestProps } from "../types";
import type { QuestionProps } from "../../questions/types";
import { PAGINATION } from "@/constants";

interface TestsState {
  // Tests by category ID
  testsByCategory: Record<string, TestProps[]>;
  // Tests by ID cache
  testsById: Record<string, TestProps>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;

  // Admin tests list state
  adminTests: TestProps[];
  adminLoading: boolean;
  adminError: string | null;

  // Form state
  isDialogOpen: boolean;
  editingTest: TestProps | null;
  viewingTest: TestProps | null;
  isEditMode: boolean;

  // Actions
  openDialog: (test?: TestProps | null) => void;
  closeDialog: () => void;
  openViewDialog: (test: TestProps) => void;
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
  loading: {},
  error: {},
  adminTests: [],
  adminLoading: false,
  adminError: null,
  isDialogOpen: false,
  editingTest: null,
  viewingTest: null,
  isEditMode: false,

  // Questions initial state
  questions: [],
  questionsLoading: false,
  questionsError: null,
  questionsTotal: 0,
  questionsMeta: undefined,
  isQuestionsDialogOpen: false,

  // Form actions
  openDialog: (test = null) => {
    set({ isDialogOpen: true, editingTest: test, isEditMode: false });
  },
  closeDialog: () => {
    set({
      isDialogOpen: false,
      editingTest: null,
      viewingTest: null,
      isEditMode: false,
    });
  },
  openViewDialog: (test) => {
    set({
      isDialogOpen: true,
      viewingTest: test,
      editingTest: null,
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
      loading: { ...state.loading, [categoryId]: true },
      error: { ...state.error, [categoryId]: null },
    }));

    try {
      const params: Record<string, any> = {
        page: 1,
        pageSize: PAGINATION.MAX_PAGE_SIZE_FOR_ALL,
      };

      const response = await apiClient.get<
        ApiSuccessResponse<Array<TestProps>>
      >(CATEGORIES_ENDPOINTS.TESTS(categoryId), { params });

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
        error instanceof Error ? error.message : "Failed to fetch tests";
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
      const response = await apiClient.get<ApiSuccessResponse<TestProps>>(
        ENDPOINTS.TESTS.GET(testId)
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
    page = 1,
    pageSize = 10,
    filters?: Record<string, string>
  ) => {
    set({ adminLoading: true, adminError: null });
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
        ENDPOINTS.TESTS.LIST,
        {
          params,
        }
      );

      const data = response.data.data || [];
      const meta = response.data.meta;

      set({
        adminTests: data,
        adminLoading: false,
      });

      return { data, meta };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch tests";
      set({ adminError: errorMessage, adminLoading: false });
      throw error;
    }
  },

  createTest: async (data) => {
    set({ adminLoading: true, adminError: null });
    try {
      const response = await apiClient.post<ApiSuccessResponse<TestProps>>(
        ENDPOINTS.TESTS.LIST,
        data
      );
      set({ adminLoading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create test";
      set({ adminError: errorMessage, adminLoading: false });
      throw error;
    }
  },

  updateTest: async (id, data) => {
    set({ adminLoading: true, adminError: null });
    try {
      const response = await apiClient.put<ApiSuccessResponse<TestProps>>(
        ENDPOINTS.TESTS.GET(id),
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

        // Update in adminTests if exists
        const updatedAdminTests = state.adminTests.map((test) =>
          test.id === id ? updatedTest : test
        );

        return {
          testsById: updatedTestsById,
          testsByCategory: updatedTestsByCategory,
          adminTests: updatedAdminTests,
          adminLoading: false,
        };
      });

      return updatedTest;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update test";
      set({ adminError: errorMessage, adminLoading: false });
      throw error;
    }
  },

  deleteTest: async (id) => {
    set({ adminLoading: true, adminError: null });
    try {
      await apiClient.delete(ENDPOINTS.TESTS.GET(id));
      set({ adminLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete test";
      set({ adminError: errorMessage, adminLoading: false });
      throw error;
    }
  },

  refreshTests: async (
    page = 1,
    pageSize = 10,
    filters?: Record<string, string>
  ) => {
    const { viewingTest } = get();
    await get().fetchTests(page, pageSize, filters);

    // Update viewingTest if it exists and dialog is still open
    if (viewingTest) {
      const { adminTests } = get();
      const updatedTest = adminTests.find((t) => t.id === viewingTest.id);
      if (updatedTest) {
        set({ viewingTest: updatedTest });
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
        error instanceof Error ? error.message : "Failed to fetch questions";
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
        error instanceof Error ? error.message : "Failed to create question";
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
        error instanceof Error ? error.message : "Failed to update question";
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
        error instanceof Error ? error.message : "Failed to fetch question";
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

// Adapter hook to provide useQuestionsStore interface from useTestsStore
const useQuestionsStoreHook = () => {
  const store = useTestsStore();
  return {
    questions: store.questions,
    loading: store.questionsLoading,
    error: store.questionsError,
    total: store.questionsTotal,
    meta: store.questionsMeta,
    isDialogOpen: store.isQuestionsDialogOpen,
    openDialog: store.openQuestionsDialog,
    closeDialog: store.closeQuestionsDialog,
    fetchQuestions: store.fetchQuestions,
    createQuestion: store.createQuestion,
    updateQuestion: store.updateQuestion,
    getQuestion: store.getQuestion,
    deleteQuestion: store.deleteQuestion,
    refreshQuestions: store.refreshQuestions,
  };
};

// Add store methods for direct access (like getState, setState, subscribe)
(useQuestionsStoreHook as any).getState = () => {
  const state = useTestsStore.getState();
  return {
    questions: state.questions,
    loading: state.questionsLoading,
    error: state.questionsError,
    total: state.questionsTotal,
    meta: state.questionsMeta,
    isDialogOpen: state.isQuestionsDialogOpen,
    openDialog: state.openQuestionsDialog,
    closeDialog: state.closeQuestionsDialog,
    fetchQuestions: state.fetchQuestions,
    createQuestion: state.createQuestion,
    updateQuestion: state.updateQuestion,
    getQuestion: state.getQuestion,
    deleteQuestion: state.deleteQuestion,
    refreshQuestions: state.refreshQuestions,
  };
};

(useQuestionsStoreHook as any).setState = (partial: any) => {
  const updates: any = {};
  if (partial.questions !== undefined) updates.questions = partial.questions;
  if (partial.loading !== undefined) updates.questionsLoading = partial.loading;
  if (partial.error !== undefined) updates.questionsError = partial.error;
  if (partial.total !== undefined) updates.questionsTotal = partial.total;
  if (partial.meta !== undefined) updates.questionsMeta = partial.meta;
  if (partial.isDialogOpen !== undefined)
    updates.isQuestionsDialogOpen = partial.isDialogOpen;
  useTestsStore.setState(updates);
};

(useQuestionsStoreHook as any).subscribe = (listener: (state: any) => void) => {
  return useTestsStore.subscribe((state) => {
    const questionsState = {
      questions: state.questions,
      loading: state.questionsLoading,
      error: state.questionsError,
      total: state.questionsTotal,
      meta: state.questionsMeta,
      isDialogOpen: state.isQuestionsDialogOpen,
      openDialog: state.openQuestionsDialog,
      closeDialog: state.closeQuestionsDialog,
      fetchQuestions: state.fetchQuestions,
      createQuestion: state.createQuestion,
      updateQuestion: state.updateQuestion,
      getQuestion: state.getQuestion,
      deleteQuestion: state.deleteQuestion,
      refreshQuestions: state.refreshQuestions,
    };
    listener(questionsState);
  });
};

export const useQuestionsStore = useQuestionsStoreHook as any;
