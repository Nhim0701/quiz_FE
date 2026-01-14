import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";

export interface Role {
  id: string;
  name: string;
  description?: string;
  default: boolean;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface RolesState {
  // Roles list
  roles: Role[];
  loading: boolean;
  error: string | null;

  // Form state
  isDialogOpen: boolean;
  editingRole: Role | null;
  viewingRole: Role | null;
  isEditMode: boolean;

  // Actions
  openDialog: (role?: Role | null) => void;
  closeDialog: () => void;
  openViewDialog: (role: Role) => void;
  setEditMode: (isEdit: boolean) => void;

  // API methods
  fetchRoles: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<{ data: Role[]; meta?: ApiResponseMeta } | undefined>;
  createRole: (data: { name: string; description?: string }) => Promise<Role>;
  updateRole: (
    id: string,
    data: {
      name: string;
      description?: string;
    }
  ) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  refreshRoles: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
}

export const useRolesStore = create<RolesState>((set, get) => ({
  // Initial state
  roles: [],
  loading: false,
  error: null,
  isDialogOpen: false,
  editingRole: null,
  viewingRole: null,
  isEditMode: false,

  // Form actions
  openDialog: (role = null) => {
    set({ isDialogOpen: true, editingRole: role, isEditMode: false });
  },
  closeDialog: () => {
    set({
      isDialogOpen: false,
      editingRole: null,
      viewingRole: null,
      isEditMode: false,
    });
  },
  openViewDialog: (role) => {
    set({
      isDialogOpen: true,
      viewingRole: role,
      editingRole: null,
      isEditMode: false,
    });
  },
  setEditMode: (isEdit) => {
    set({ isEditMode: isEdit });
  },

  // API methods
  fetchRoles: async (
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

      const response = await apiClient.get<ApiSuccessResponse<Role[]>>(
        ENDPOINTS.LIST,
        {
          params,
        }
      );

      const data = response.data.data || [];
      const meta = response.data.meta;

      set({
        roles: data,
        loading: false,
      });

      return { data, meta };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch roles";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createRole: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiSuccessResponse<Role>>(
        ENDPOINTS.CREATE,
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create role";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateRole: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<ApiSuccessResponse<Role>>(
        ENDPOINTS.UPDATE(id),
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update role";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteRole: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(ENDPOINTS.DELETE(id));
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete role";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  refreshRoles: async (
    page = 1,
    pageSize = 10,
    filters?: Record<string, string>
  ) => {
    const { viewingRole } = get();
    await get().fetchRoles(page, pageSize, filters);

    // Update viewingRole if it exists and dialog is still open
    if (viewingRole) {
      const { roles } = get();
      const updatedRole = roles.find((r) => r.id === viewingRole.id);
      if (updatedRole) {
        set({ viewingRole: updatedRole });
      }
    }
  },
}));
