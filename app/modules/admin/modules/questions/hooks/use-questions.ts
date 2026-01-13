import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";
import type { QuestionState, QuestionProps } from "../types";

export const useQuestionsStore = create<QuestionState>((set, get) => ({
  // Initial state
  questions: [],
  loading: false,
  error: null,
  total: 0,
  meta: undefined,
  isDialogOpen: false,

  // Dialog actions
  openDialog: () => set({ isDialogOpen: true }),
  closeDialog: () => set({ isDialogOpen: false }),

  // Fetch questions for a test
  fetchQuestions: async (
    page = 1,
    pageSize = 10,
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
        ENDPOINTS.QUESTIONS.LIST,
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
        error instanceof Error ? error.message : "Failed to fetch questions";
      set({
        error: errorMessage,
        loading: false,
        questions: [],
        total: 0,
      });
      throw error;
    }
  },

  // Create a question
  createQuestion: async (data: {
    testId: string;
    content: string;
    isMultipleChoice: boolean;
  }) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiSuccessResponse<QuestionProps>>(
        ENDPOINTS.QUESTIONS.CREATE,
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create question";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Update a question
  updateQuestion: async (
    testId: string,
    questionId: string,
    data: { content: string; isMultipleChoice: boolean }
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<ApiSuccessResponse<QuestionProps>>(
        ENDPOINTS.QUESTIONS.UPDATE(questionId),
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update question";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Get a single question
  getQuestion: async (testId: string, questionId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<ApiSuccessResponse<QuestionProps>>(
        ENDPOINTS.QUESTIONS.GET(questionId)
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch question";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Delete a question
  deleteQuestion: async (
    testId: string,
    questionId: string,
    page = 1,
    pageSize = 10,
    filters?: Record<string, string>
  ) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(ENDPOINTS.QUESTIONS.DELETE(questionId));
      // Refresh questions after delete
      await get().fetchQuestions(page, pageSize, filters);
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete question";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Refresh questions
  refreshQuestions: async (
    testId: string,
    page = 1,
    pageSize = 10,
    filters?: Record<string, string>
  ) => {
    await get().fetchQuestions(page, pageSize, filters);
  },
}));
