import { create } from "zustand";
import type { ApiSuccessResponse } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";
import type { AnswerProps, QuestionProps } from "../types";
import { FILTER_QUERY_PARAMS } from "@/constants";

interface AnswerState {
  loading: boolean;
  error: string | null;
  answers: AnswerProps[];
  fetchAnswers: (questionId: string) => Promise<AnswerProps[]>;
  createAnswer: (
    questionId: string,
    data: Omit<AnswerProps, "id">
  ) => Promise<AnswerProps>;
  updateAnswer: (
    answerId: string,
    data: Omit<AnswerProps, "id">
  ) => Promise<AnswerProps>;
  deleteAnswer: (answerId: string) => Promise<void>;
}

export const useAnswerStore = create<AnswerState>((set) => ({
  // Initial state
  loading: false,
  error: null,
  answers: [],

  // Fetch answers for a question
  fetchAnswers: async (questionId: string) => {
    set({ loading: true, error: null });
    try {
      // Get answers from question endpoint (which includes answers)
      const questionResponse = await apiClient.get<
        ApiSuccessResponse<QuestionProps>
      >(ENDPOINTS.ANSWERS.LIST, {
        params: {
          [FILTER_QUERY_PARAMS.FILTER_KEY(1)]: "question_id",
          [FILTER_QUERY_PARAMS.FILTER_VALUE(1)]: questionId,
        },
      });
      const answers = questionResponse.data.data?.answers || [];
      set({ answers, loading: false });
      return answers;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch answers";
      set({ error: errorMessage, loading: false, answers: [] });
      throw error;
    }
  },

  // Create an answer
  createAnswer: async (questionId: string, data: Omit<AnswerProps, "id">) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiSuccessResponse<AnswerProps>>(
        ENDPOINTS.ANSWERS.CREATE,
        {
          ...data,
          questionId,
        }
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create answer";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Update an answer
  updateAnswer: async (answerId: string, data: Omit<AnswerProps, "id">) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<ApiSuccessResponse<AnswerProps>>(
        ENDPOINTS.ANSWERS.UPDATE(answerId),
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update answer";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Delete an answer
  deleteAnswer: async (answerId: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(ENDPOINTS.ANSWERS.DELETE(answerId));
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete answer";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));
