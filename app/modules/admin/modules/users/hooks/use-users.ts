import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import type { User } from "@/modules/common/auth/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";

interface UsersState {
  // Users list
  users: User[];
  loading: boolean;
  error: string | null;

  // Form state
  isDialogOpen: boolean;
  editingUser: User | null;
  viewingUser: User | null;
  isEditMode: boolean;

  // Actions
  openDialog: (user?: User | null) => void;
  closeDialog: () => void;
  openViewDialog: (user: User) => void;
  setEditMode: (isEdit: boolean) => void;

  // API methods
  fetchUsers: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<{ data: User[]; meta?: ApiResponseMeta } | undefined>;
  createUser: (data: {
    fullName: string;
    email: string;
    phone?: string;
    birthday?: string;
    address?: string;
    jobTitle?: string;
    company?: string;
  }) => Promise<User>;
  updateUser: (
    id: string,
    data: {
      fullName: string;
      email: string;
      phone?: string;
      birthday?: string;
      address?: string;
      jobTitle?: string;
      company?: string;
    }
  ) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  refreshUsers: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
  changePassword: (id: string, newPassword: string) => Promise<void>;
  assignRoles: (id: string, roleId: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  // Initial state
  users: [],
  loading: false,
  error: null,
  isDialogOpen: false,
  editingUser: null,
  viewingUser: null,
  isEditMode: false,

  // Form actions
  openDialog: (user = null) => {
    set({ isDialogOpen: true, editingUser: user, isEditMode: false });
  },
  closeDialog: () => {
    set({
      isDialogOpen: false,
      editingUser: null,
      viewingUser: null,
      isEditMode: false,
    });
  },
  openViewDialog: (user) => {
    set({
      isDialogOpen: true,
      viewingUser: user,
      editingUser: null,
      isEditMode: false,
    });
  },
  setEditMode: (isEdit) => {
    set({ isEditMode: isEdit });
  },

  // API methods
  fetchUsers: async (
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

      const response = await apiClient.get<ApiSuccessResponse<User[]>>(
        ENDPOINTS.LIST,
        {
          params,
        }
      );

      const data = response.data.data || [];
      const meta = response.data.meta;

      set({
        users: data,
        loading: false,
      });

      return { data, meta };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch users";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createUser: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiSuccessResponse<User>>(
        ENDPOINTS.CREATE,
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create user";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateUser: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<ApiSuccessResponse<User>>(
        ENDPOINTS.UPDATE(id),
        data
      );
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(ENDPOINTS.DELETE(id));
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  refreshUsers: async (
    page = 1,
    pageSize = 10,
    filters?: Record<string, string>
  ) => {
    const { viewingUser } = get();
    await get().fetchUsers(page, pageSize, filters);

    // Update viewingUser if it exists and dialog is still open
    if (viewingUser) {
      const { users } = get();
      const updatedUser = users.find((u) => u.id === viewingUser.id);
      if (updatedUser) {
        set({ viewingUser: updatedUser });
      }
    }
  },

  changePassword: async (id, newPassword) => {
    set({ loading: true, error: null });
    try {
      await apiClient.put(ENDPOINTS.CHANGE_PASSWORD(id), {
        newPassword,
      });
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to change password";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  assignRoles: async (id, roleId) => {
    set({ loading: true, error: null });
    try {
      await apiClient.put(ENDPOINTS.ASSIGN_ROLES(id), {
        roleId,
      });
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to assign roles";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));
