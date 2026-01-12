import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";

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
  isSheetOpen: boolean;
  editingCategory: Category | null;

  // Actions
  openSheet: (category?: Category | null) => void;
  closeSheet: () => void;

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
  isSheetOpen: false,
  editingCategory: null,

  // Form actions
  openSheet: (category = null) => {
    set({ isSheetOpen: true, editingCategory: category });
  },
  closeSheet: () => {
    set({ isSheetOpen: false, editingCategory: null });
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
        API_ENDPOINTS.CATEGORIES.LIST,
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
        API_ENDPOINTS.CATEGORIES.LIST,
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
        API_ENDPOINTS.CATEGORIES.GET(id),
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
      await apiClient.delete(API_ENDPOINTS.CATEGORIES.GET(id));
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
    await get().fetchCategories(page, pageSize, filters);
  },
}));
