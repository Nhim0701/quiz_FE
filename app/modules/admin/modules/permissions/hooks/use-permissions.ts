import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PermissionsState {
  // Permissions list
  permissions: Permission[];
  loading: boolean;
  error: string | null;

  // Form state
  isDialogOpen: boolean;
  editingPermission: Permission | null;
  viewingPermission: Permission | null;
  isEditMode: boolean;

  // Actions
  openDialog: (permission?: Permission | null) => void;
  closeDialog: () => void;
  openViewDialog: (permission: Permission) => void;
  setEditMode: (isEdit: boolean) => void;

  // API methods
  fetchPermissions: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<{ data: Permission[]; meta?: ApiResponseMeta } | undefined>;
  createPermission: (data: {
    name: string;
    description?: string;
    resource: string;
    action: string;
  }) => Promise<Permission>;
  updatePermission: (
    id: string,
    data: {
      name: string;
      description?: string;
      resource: string;
      action: string;
    }
  ) => Promise<Permission>;
  deletePermission: (id: string) => Promise<void>;
  refreshPermissions: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  // Initial state
  permissions: [],
  loading: false,
  error: null,
  isDialogOpen: false,
  editingPermission: null,
  viewingPermission: null,
  isEditMode: false,

  // Form actions
  openDialog: (permission = null) => {
    set({
      isDialogOpen: true,
      editingPermission: permission,
      isEditMode: false,
    });
  },
  closeDialog: () => {
    set({
      isDialogOpen: false,
      editingPermission: null,
      viewingPermission: null,
      isEditMode: false,
    });
  },
  openViewDialog: (permission) => {
    set({
      isDialogOpen: true,
      viewingPermission: permission,
      editingPermission: null,
      isEditMode: false,
    });
  },
  setEditMode: (isEdit) => {
    set({ isEditMode: isEdit });
  },

  // API methods
  fetchPermissions: async (
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

      const response = await apiClient.get<ApiSuccessResponse<Permission[]>>(
        ENDPOINTS.LIST,
        {
          params,
        }
      );

      const data = response.data.data || [];
      const meta = response.data.meta;

      set({
        permissions: data,
        loading: false,
      });

      return { data, meta };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch permissions";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createPermission: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiSuccessResponse<Permission>>(
        ENDPOINTS.CREATE,
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create permission";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updatePermission: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<ApiSuccessResponse<Permission>>(
        ENDPOINTS.UPDATE(id),
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update permission";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deletePermission: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(ENDPOINTS.DELETE(id));
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete permission";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  refreshPermissions: async (
    page = 1,
    pageSize = 10,
    filters?: Record<string, string>
  ) => {
    const { viewingPermission } = get();
    await get().fetchPermissions(page, pageSize, filters);

    // Update viewingPermission if it exists and dialog is still open
    if (viewingPermission) {
      const { permissions } = get();
      const updatedPermission = permissions.find(
        (p) => p.id === viewingPermission.id
      );
      if (updatedPermission) {
        set({ viewingPermission: updatedPermission });
      }
    }
  },
}));
