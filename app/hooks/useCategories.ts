import { create } from "zustand";
import type { ApiSuccessResponse } from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";

export interface Category {
  id: string;
  name: string;
}

interface CategoriesState {
  // Categories list
  categories: Category[];
  loading: boolean;
  error: string | null;

  // API methods
  getCategories: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  // Initial state
  categories: [],
  loading: false,
  error: null,

  // API methods
  getCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<ApiSuccessResponse<Array<Category>>>(
        API_ENDPOINTS.CATEGORIES.LIST
      );
      set({ categories: response.data.data, loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch categories";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));
