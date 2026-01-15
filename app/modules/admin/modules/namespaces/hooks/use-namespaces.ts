import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";

export interface Namespace {
  id: string;
  name: string;
  description?: string;
  prefix: string;
}

interface NamespacesState {
  namespaces: Namespace[];
  loading: boolean;
  error: string | null;

  isDialogOpen: boolean;
  dialogMode: FormDialogMode | null;
  namespace: Namespace | null;
  isEditMode: boolean;

  openDialog: (mode: FormDialogMode, namespace?: Namespace | null) => void;
  closeDialog: () => void;
  setEditMode: (isEdit: boolean) => void;

  // API methods
  fetchNamespaces: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<{ data: Namespace[]; meta?: ApiResponseMeta } | undefined>;
  createNamespace: (data: {
    name: string;
    prefix: string;
    description?: string;
  }) => Promise<Namespace>;
  updateNamespace: (
    id: string,
    data: { name: string; prefix: string; description?: string }
  ) => Promise<Namespace>;
  deleteNamespace: (id: string) => Promise<void>;
  refreshNamespaces: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
}

export const useNamespacesStore = create<NamespacesState>((set, get) => ({
  namespaces: [],
  loading: false,
  error: null,
  isDialogOpen: false,
  dialogMode: null,
  namespace: null,
  isEditMode: false,

  openDialog: (mode: FormDialogMode, namespace?: Namespace | null) => {
    set({
      isDialogOpen: true,
      dialogMode: mode,
      namespace: namespace ?? null,
      isEditMode: mode === DIALOG_MODES.EDIT,
    });
  },
  closeDialog: () => {
    set({
      isDialogOpen: false,
      dialogMode: null,
      namespace: null,
      isEditMode: false,
    });
  },
  setEditMode: (isEdit) => {
    set({ isEditMode: isEdit });
  },

  // API methods
  fetchNamespaces: async (
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

      const response = await apiClient.get<ApiSuccessResponse<Namespace[]>>(
        ENDPOINTS.LIST,
        {
          params,
        }
      );

      const data = response.data.data || [];
      const meta = response.data.meta;

      set({
        namespaces: data,
        loading: false,
      });

      return { data, meta };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch namespaces";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createNamespace: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiSuccessResponse<Namespace>>(
        ENDPOINTS.CREATE,
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create namespace";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateNamespace: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<ApiSuccessResponse<Namespace>>(
        ENDPOINTS.UPDATE(id),
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update namespace";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteNamespace: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(ENDPOINTS.DELETE(id));
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete namespace";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  refreshNamespaces: async (
    page = 1,
    pageSize = 10,
    filters?: Record<string, string>
  ) => {
    const { namespace, dialogMode } = get();
    await get().fetchNamespaces(page, pageSize, filters);

    if (namespace && dialogMode) {
      const { namespaces } = get();
      const updatedNamespace = namespaces.find((n) => n.id === namespace.id);
      if (updatedNamespace) {
        set({ namespace: updatedNamespace });
      }
    }
  },
}));
