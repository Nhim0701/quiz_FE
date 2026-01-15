import { create } from "zustand";
import type { ApiSuccessResponse, ApiResponseMeta } from "@/types";
import type { User } from "@/modules/common/auth/types";
import { apiClient } from "@/lib";
import { ENDPOINTS, ERROR_MESSAGES, DEFAULT_VALUES } from "../constants";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";
import { t } from "@/i18n/utils";

interface UsersState {
  // Users list
  users: User[];
  loading: boolean;
  error: string | null;
  total: number;
  meta?: ApiResponseMeta;

  // Form state
  isDialogOpen: boolean;
  dialogMode: FormDialogMode | null;
  user: User | null;
  isEditMode: boolean;

  // Actions
  openDialog: (mode: FormDialogMode, user?: User | null) => void;
  closeDialog: () => void;
  setEditMode: (isEdit: boolean) => void;

  // API methods
  fetchUsers: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
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
  total: 0,
  meta: undefined,
  isDialogOpen: false,
  dialogMode: null,
  user: null,
  isEditMode: false,

  // Form actions
  openDialog: (mode: FormDialogMode, user?: User | null) => {
    set({
      isDialogOpen: true,
      dialogMode: mode,
      user: user ?? null,
      isEditMode: mode === DIALOG_MODES.EDIT,
    });
  },
  closeDialog: () => {
    set({
      isDialogOpen: false,
      dialogMode: null,
      user: null,
      isEditMode: false,
    });
  },
  setEditMode: (isEdit) => {
    set({ isEditMode: isEdit });
  },

  // API methods
  fetchUsers: async (
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
        total: meta?.total || data.length || 0,
        meta: meta,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t(ERROR_MESSAGES.FETCH_FAILED);
      set({
        error: errorMessage,
        loading: false,
        users: [],
        total: 0,
      });
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
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.CREATE_FAILED);
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
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.UPDATE_FAILED);
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
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.DELETE_FAILED);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  refreshUsers: async (
    page = DEFAULT_VALUES.PAGE,
    pageSize = DEFAULT_VALUES.PAGE_SIZE,
    filters?: Record<string, string>
  ) => {
    const { user, dialogMode } = get();
    await get().fetchUsers(page, pageSize, filters);

    // Update user if it exists and dialog is still open
    if (user && dialogMode) {
      const { users } = get();
      const updatedUser = users.find((u) => u.id === user.id);
      if (updatedUser) {
        set({ user: updatedUser });
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
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.CHANGE_PASSWORD_FAILED);
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
        error instanceof Error
          ? error.message
          : t(ERROR_MESSAGES.ASSIGN_ROLES_FAILED);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));
