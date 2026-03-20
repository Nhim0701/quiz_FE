import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS, ERROR_MESSAGES, DEFAULT_VALUES } from "../constants";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";
import { t } from "@/i18n/utils";
import type { TranslationKey } from "@/i18n";

export interface TestAssignment {
  id: string;
  userId: string;
  testId: string;
  userName?: string;
  userEmail?: string;
  testName?: string;
  createdAt?: string;
}

interface TestAssignmentsState {
  assignments: TestAssignment[];
  loading: boolean;
  error: string | null;
  total: number;
  meta?: ApiResponseMeta;

  isDialogOpen: boolean;
  dialogMode: FormDialogMode | null;
  assignment: TestAssignment | null;

  openDialog: (mode: FormDialogMode, assignment?: TestAssignment | null) => void;
  closeDialog: () => void;

  fetchTestAssignments: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<{ data: TestAssignment[]; meta?: ApiResponseMeta } | undefined>;
  createTestAssignment: (data: { userId: string; testId: string }) => Promise<TestAssignment>;
  deleteTestAssignment: (id: string) => Promise<void>;
  refreshTestAssignments: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
}

export const useTestAssignmentsStore = create<TestAssignmentsState>((set, get) => ({
  assignments: [],
  loading: false,
  error: null,
  total: 0,
  meta: undefined,
  isDialogOpen: false,
  dialogMode: null,
  assignment: null,

  openDialog: (mode: FormDialogMode, assignment?: TestAssignment | null) => {
    set({
      isDialogOpen: true,
      dialogMode: mode,
      assignment: assignment ?? null,
    });
  },
  closeDialog: () => {
    set({
      isDialogOpen: false,
      dialogMode: null,
      assignment: null,
    });
  },

  fetchTestAssignments: async (
    page = DEFAULT_VALUES.PAGE,
    pageSize = DEFAULT_VALUES.PAGE_SIZE,
    filters?: Record<string, string>
  ) => {
    set({ loading: true, error: null });
    try {
      const params: Record<string, any> = { page, pageSize };
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && typeof value === "string" && value.trim()) {
            params[key] = value;
          }
        });
      }

      const response = await apiClient.get<ApiSuccessResponse<TestAssignment[]>>(
        ENDPOINTS.LIST,
        { params }
      );

      const data = response.data.data || [];
      const meta = response.data.meta;

      set({
        assignments: data,
        loading: false,
        total: meta?.total || data.length || 0,
        meta,
      });
      return { data, meta };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.FETCH_FAILED as TranslationKey);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createTestAssignment: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiSuccessResponse<TestAssignment>>(
        ENDPOINTS.CREATE,
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.CREATE_FAILED as TranslationKey);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteTestAssignment: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(ENDPOINTS.DELETE(id));
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.DELETE_FAILED as TranslationKey);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  refreshTestAssignments: async (
    page = DEFAULT_VALUES.PAGE,
    pageSize = DEFAULT_VALUES.PAGE_SIZE,
    filters?: Record<string, string>
  ) => {
    await get().fetchTestAssignments(page, pageSize, filters);
  },
}));
