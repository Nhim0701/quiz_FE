import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { API_ENDPOINTS } from "@/constants";
import type { QuestionState, QuestionProps } from "../types";

export const useQuestionStore = create<QuestionState>((set, get) => ({
  // Initial state
  questions: [],
  loading: false,
  error: null,
  total: 0,
  meta: undefined,

  // Fetch questions for a test
  fetchQuestions: async (
    testId: string,
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
        API_ENDPOINTS.TESTS.QUESTIONS(testId),
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
      await apiClient.delete(API_ENDPOINTS.TESTS.QUESTION(testId, questionId));
      // Refresh questions after delete
      await get().fetchQuestions(testId, page, pageSize, filters);
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
    await get().fetchQuestions(testId, page, pageSize, filters);
  },
}));
