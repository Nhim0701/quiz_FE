import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";

export interface Permission {
  id: string;
  name: string;
  permission: string;
  description?: string;
  roleId?: string;
  roleName?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PermissionsState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;

  isDialogOpen: boolean;
  dialogMode: FormDialogMode | null;
  permission: Permission | null;
  isEditMode: boolean;

  openDialog: (mode: FormDialogMode, permission?: Permission | null) => void;
  closeDialog: () => void;
  setEditMode: (isEdit: boolean) => void;

  // API methods
  fetchPermissions: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<{ data: Permission[]; meta?: ApiResponseMeta } | undefined>;
  createPermission: (data: {
    name: string;
    permission: string;
    description?: string;
    roleId?: string;
  }) => Promise<Permission>;
  updatePermission: (
    id: string,
    data: {
      name: string;
      permission: string;
      description?: string;
      roleId?: string;
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
  permissions: [],
  loading: false,
  error: null,
  isDialogOpen: false,
  dialogMode: null,
  permission: null,
  isEditMode: false,

  openDialog: (mode: FormDialogMode, permission?: Permission | null) => {
    set({
      isDialogOpen: true,
      dialogMode: mode,
      permission: permission ?? null,
      isEditMode: mode === DIALOG_MODES.EDIT,
    });
  },
  closeDialog: () => {
    set({
      isDialogOpen: false,
      dialogMode: null,
      permission: null,
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
    const { permission, dialogMode } = get();
    await get().fetchPermissions(page, pageSize, filters);

    if (permission && dialogMode) {
      const { permissions } = get();
      const updatedPermission = permissions.find((p) => p.id === permission.id);
      if (updatedPermission) {
        set({ permission: updatedPermission });
      }
    }
  },
}));
