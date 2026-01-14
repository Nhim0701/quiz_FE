import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS, ERROR_MESSAGES, DEFAULT_VALUES } from "../constants";
import type { QuestionProps } from "../types";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";
import { t } from "@/i18n/utils";

interface QuestionsState {
  // Questions list state
  questions: QuestionProps[];
  loading: boolean;
  error: string | null;
  total: number;
  meta?: ApiResponseMeta;

  // Dialog state
  isDialogOpen: boolean;
  dialogMode: FormDialogMode | null;
  question: QuestionProps | null;
  isEditMode: boolean;
  openDialog: (mode: FormDialogMode, question?: QuestionProps | null) => void;
  closeDialog: () => void;
  setEditMode: (isEdit: boolean) => void;

  // API methods
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

export const useQuestionsStore = create<QuestionsState>((set, get) => ({
  // Initial state
  questions: [],
  loading: false,
  error: null,
  total: 0,
  meta: undefined,
  isDialogOpen: false,
  dialogMode: null,
  question: null,
  isEditMode: false,

  // Dialog actions
  openDialog: (mode: FormDialogMode, question?: QuestionProps | null) => {
    set({
      isDialogOpen: true,
      dialogMode: mode,
      question: question ?? null,
      isEditMode: mode === DIALOG_MODES.EDIT,
    });
  },
  closeDialog: () => {
    set({
      isDialogOpen: false,
      dialogMode: null,
      question: null,
      isEditMode: false,
    });
  },
  setEditMode: (isEdit) => {
    set({ isEditMode: isEdit });
  },

  // API methods
  fetchQuestions: async (
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

      const response = await apiClient.get<ApiSuccessResponse<QuestionProps[]>>(
        ENDPOINTS.LIST,
        {
          params,
        }
      );
      set({
        questions: response.data.data || [],
        loading: false,
        total: response.data.meta?.total || response.data.data?.length || 0,
        meta: response.data.meta,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t(ERROR_MESSAGES.FETCH_FAILED);
      set({
        error: errorMessage,
        loading: false,
        questions: [],
        total: 0,
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
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiSuccessResponse<QuestionProps>>(
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
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<ApiSuccessResponse<QuestionProps>>(
        ENDPOINTS.UPDATE(questionId),
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.UPDATE_FAILED);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  getQuestion: async (testId: string, questionId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<ApiSuccessResponse<QuestionProps>>(
        ENDPOINTS.GET(questionId)
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t(ERROR_MESSAGES.FETCH_FAILED);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteQuestion: async (
    testId: string,
    questionId: string,
    page = DEFAULT_VALUES.PAGE,
    pageSize = DEFAULT_VALUES.PAGE_SIZE,
    filters?: Record<string, string>
  ) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(ENDPOINTS.DELETE(questionId));
      // Refresh questions after delete
      await get().fetchQuestions(page, pageSize, filters);
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

  refreshQuestions: async (
    testId: string,
    page = DEFAULT_VALUES.PAGE,
    pageSize = DEFAULT_VALUES.PAGE_SIZE,
    filters?: Record<string, string>
  ) => {
    const { question, dialogMode } = get();
    await get().fetchQuestions(page, pageSize, filters);

    // Update question if it exists and dialog is still open
    if (question && dialogMode) {
      const { questions } = get();
      const updatedQuestion = questions.find((q) => q.id === question.id);
      if (updatedQuestion) {
        set({ question: updatedQuestion });
      }
    }
  },
}));
