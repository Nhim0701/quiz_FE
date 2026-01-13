import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";

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

  // Form state
  isDialogOpen: boolean;
  editingCategory: Category | null;
  viewingCategory: Category | null;
  isEditMode: boolean;

  // Actions
  openDialog: (category?: Category | null) => void;
  closeDialog: () => void;
  openViewDialog: (category: Category) => void;
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
  isDialogOpen: false,
  editingCategory: null,
  viewingCategory: null,
  isEditMode: false,

  // Form actions
  openDialog: (category = null) => {
    set({ isDialogOpen: true, editingCategory: category, isEditMode: false });
  },
  closeDialog: () => {
    set({
      isDialogOpen: false,
      editingCategory: null,
      viewingCategory: null,
      isEditMode: false,
    });
  },
  openViewDialog: (category) => {
    set({
      isDialogOpen: true,
      viewingCategory: category,
      editingCategory: null,
      isEditMode: false,
    });
  },
  setEditMode: (isEdit) => {
    set({ isEditMode: isEdit });
  },

  // API methods
  fetchCategories: async (
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
        {
          params,
        }
      );

      const data = response.data.data || [];
      const meta = response.data.meta;

      set({
        categories: data,
        loading: false,
      });

      return { data, meta };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch categories";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createCategory: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiSuccessResponse<Category>>(
        ENDPOINTS.LIST,
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create category";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<ApiSuccessResponse<Category>>(
        ENDPOINTS.GET(id),
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update category";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(ENDPOINTS.GET(id));
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete category";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  refreshCategories: async (
    page = 1,
    pageSize = 10,
    filters?: Record<string, string>
  ) => {
    const { viewingCategory } = get();
    await get().fetchCategories(page, pageSize, filters);

    // Update viewingCategory if it exists and dialog is still open
    if (viewingCategory) {
      const { categories } = get();
      const updatedCategory = categories.find(
        (c) => c.id === viewingCategory.id
      );
      if (updatedCategory) {
        set({ viewingCategory: updatedCategory });
      }
    }
  },
}));
