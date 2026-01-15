import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS, ERROR_MESSAGES, DEFAULT_VALUES } from "../constants";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";
import { t } from "@/i18n/utils";

export interface Category {
  id: string;
  name: string;
  questionCount?: number;
}

interface CategoriesState {
  // Categories list
  categories: Category[];
  loading: boolean;
  error: string | null;
  total: number;
  meta?: ApiResponseMeta;

  // Form state
  isDialogOpen: boolean;
  dialogMode: FormDialogMode | null;
  category: Category | null;
  isEditMode: boolean;

  // Actions
  openDialog: (mode: FormDialogMode, category?: Category | null) => void;
  closeDialog: () => void;
  setEditMode: (isEdit: boolean) => void;

  // API methods
  fetchCategories: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<{ data: Category[]; meta?: ApiResponseMeta } | undefined>;
  createCategory: (data: { name: string }) => Promise<Category>;
  updateCategory: (id: string, data: { name: string }) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  refreshCategories: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  // Initial state
  categories: [],
  loading: false,
  error: null,
  total: 0,
  meta: undefined,
  isDialogOpen: false,
  dialogMode: null,
  category: null,
  isEditMode: false,

  // Form actions
  openDialog: (mode: FormDialogMode, category?: Category | null) => {
    set({
      isDialogOpen: true,
      dialogMode: mode,
      category: category ?? null,
      isEditMode: mode === DIALOG_MODES.EDIT,
    });
  },
  closeDialog: () => {
    set({
      isDialogOpen: false,
      dialogMode: null,
      category: null,
      isEditMode: false,
    });
  },
  setEditMode: (isEdit) => {
    set({ isEditMode: isEdit });
  },

  // API methods
  fetchCategories: async (
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
      // Filters are already in format: {filter-key-1: "name", filter-value-1: "C02", ...}
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && typeof value === "string" && value.trim()) {
            params[key] = value;
          }
        });
      }

      const response = await apiClient.get<ApiSuccessResponse<Category[]>>(
        ENDPOINTS.LIST,
        { params }
      );

      const data = response.data.data || [];
      const meta = response.data.meta;

      set({
        categories: data,
        loading: false,
        total: meta?.total || data.length || 0,
        meta,
      });
      return { data, meta };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t(ERROR_MESSAGES.FETCH_FAILED);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createCategory: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiSuccessResponse<Category>>(
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

  updateCategory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<ApiSuccessResponse<Category>>(
        ENDPOINTS.UPDATE(id),
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

  deleteCategory: async (id) => {
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

  refreshCategories: async (
    page = DEFAULT_VALUES.PAGE,
    pageSize = DEFAULT_VALUES.PAGE_SIZE,
    filters?: Record<string, string>
  ) => {
    const { category, dialogMode } = get();
    await get().fetchCategories(page, pageSize, filters);

    // Update category if it exists and dialog is still open
    if (category && dialogMode) {
      const { categories } = get();
      const updatedCategory = categories.find((c) => c.id === category.id);
      if (updatedCategory) {
        set({ category: updatedCategory });
      }
    }
  },
}));
