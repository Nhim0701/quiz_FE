import { create } from "zustand";
import type { ApiSuccessResponse } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";
import type { AnswerProps } from "../types";
import { FILTER_QUERY_PARAMS } from "@/constants";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";

interface AnswerState {
  loading: boolean;
  error: string | null;
  answers: AnswerProps[];
  questionId: string | null;
  isDialogOpen: boolean;
  dialogMode: FormDialogMode | null;
  answer: AnswerProps | null;
  isEditMode: boolean;
  openDialog: (
    mode: FormDialogMode,
    questionId: string,
    answer?: AnswerProps | null
  ) => void;
  closeDialog: () => void;
  setEditMode: (isEdit: boolean) => void;
  fetchAnswers: (questionId: string) => Promise<AnswerProps[]>;
  createAnswer: (
    questionId: string,
    data: Omit<AnswerProps, "id">
  ) => Promise<AnswerProps>;
  updateAnswer: (
    answerId: string,
    data: Omit<AnswerProps, "id">
  ) => Promise<AnswerProps>;
  deleteAnswer: (answerId: string, questionId: string) => Promise<void>;
  refreshAnswers: (questionId: string) => Promise<void>;
}

export const useAnswerStore = create<AnswerState>((set, get) => ({
  loading: false,
  error: null,
  answers: [],
  questionId: null,
  isDialogOpen: false,
  dialogMode: null,
  answer: null,
  isEditMode: false,

  openDialog: (
    mode: FormDialogMode,
    questionId: string,
    answer?: AnswerProps | null
  ) => {
    set({
      isDialogOpen: true,
      dialogMode: mode,
      questionId,
      answer: answer ?? null,
      isEditMode: mode === DIALOG_MODES.EDIT,
    });
  },

  closeDialog: () => {
    set({
      isDialogOpen: false,
      dialogMode: null,
      answer: null,
      isEditMode: false,
    });
  },

  setEditMode: (isEdit: boolean) => {
    set({ isEditMode: isEdit });
  },

  fetchAnswers: async (questionId: string) => {
    set({ loading: true, error: null });
    try {
      // Get answers from answers endpoint with question_id filter
      const response = await apiClient.get<ApiSuccessResponse<AnswerProps[]>>(
        ENDPOINTS.ANSWERS.LIST,
        {
          params: {
            [FILTER_QUERY_PARAMS.FILTER_KEY(1)]: "question_id",
            [FILTER_QUERY_PARAMS.FILTER_VALUE(1)]: questionId,
          },
        }
      );
      const answers = response.data.data || [];
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
      const newAnswer = response.data.data;
      // Add new answer to the list
      set((state) => ({
        answers: [...state.answers, newAnswer],
        loading: false,
      }));
      return newAnswer;
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
      const updatedAnswer = response.data.data;
      // Update answer in the list
      set((state) => ({
        answers: state.answers.map((answer) =>
          answer.id === answerId ? updatedAnswer : answer
        ),
        loading: false,
      }));
      return updatedAnswer;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update answer";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteAnswer: async (answerId: string, questionId: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(ENDPOINTS.ANSWERS.DELETE(answerId));
      await get().fetchAnswers(questionId);
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete answer";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  refreshAnswers: async (questionId: string) => {
    const { answer, dialogMode } = get();
    await get().fetchAnswers(questionId);

    if (answer && dialogMode) {
      const { answers } = get();
      const updatedAnswer = answers.find((a) => a.id === answer.id);
      if (updatedAnswer) {
        set({ answer: updatedAnswer });
      }
    }
  },
}));
