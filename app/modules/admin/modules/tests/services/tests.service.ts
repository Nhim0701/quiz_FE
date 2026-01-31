import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS, DEFAULT_VALUES } from "../constants";
import type { TestProps } from "../types";

export const testsService = {
  getTestsByCategory: async (
    categoryId: string, 
    page: number = 1, 
    pageSize: number = 100
  ): Promise<TestProps[]> => {
    const params: Record<string, any> = {
      page,
      pageSize,
      category_id: categoryId,
    };

    const response = await apiClient.get<ApiSuccessResponse<Array<TestProps>>>(
      ENDPOINTS.LIST,
      { params }
    );

    return response.data.data || [];
  },

  getTestById: async (testId: string): Promise<TestProps | null> => {
    try {
      const response = await apiClient.get<ApiSuccessResponse<TestProps>>(
        ENDPOINTS.GET(testId)
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch test:", error);
      return null;
    }
  },

  fetchTests: async (
    page = DEFAULT_VALUES.PAGE,
    pageSize = DEFAULT_VALUES.PAGE_SIZE,
    filters?: Record<string, string>
  ): Promise<{ data: TestProps[]; meta?: ApiResponseMeta }> => {
    const params: Record<string, any> = {
      page,
      pageSize,
    };

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && typeof value === "string" && value.trim()) {
          params[key] = value;
        }
      });
    }

    const response = await apiClient.get<ApiSuccessResponse<TestProps[]>>(
      ENDPOINTS.LIST,
      { params }
    );

    return {
      data: response.data.data || [],
      meta: response.data.meta,
    };
  },

  createTest: async (data: {
    name: string;
    categoryId: string;
    description?: string;
    timeLimit: number;
  }): Promise<TestProps> => {
    const response = await apiClient.post<ApiSuccessResponse<TestProps>>(
      ENDPOINTS.CREATE,
      data
    );
    return response.data.data;
  },

  updateTest: async (
    id: string,
    data: {
      name: string;
      categoryId: string;
      description?: string;
      timeLimit: number;
    }
  ): Promise<TestProps> => {
    const response = await apiClient.put<ApiSuccessResponse<TestProps>>(
      ENDPOINTS.UPDATE(id),
      data
    );
    return response.data.data;
  },

  deleteTest: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.DELETE(id));
  },
};
