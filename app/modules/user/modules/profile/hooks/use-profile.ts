import { create } from "zustand";
import { useTranslation } from "@/i18n";
import { useApp } from "@/hooks";
import type { ApiSuccessResponse } from "@/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";
import { AuthMapper } from "@/modules/common/auth/utils";
import type { User } from "../types";
import type { UpdateUserFormData, ChangePasswordFormData } from "../schemas";

interface ProfileState {
  // Profile data
  user: User | null;

  // API methods
  getCurrentUser: (setLoading?: (loading: boolean) => void) => Promise<void>;
  updateUserInfo: (
    formData: UpdateUserFormData,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>;
  changePassword: (
    formData: ChangePasswordFormData,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  // Initial state
  user: null,

  // API methods
  getCurrentUser: async (setLoading) => {
    if (setLoading) setLoading(true);
    try {
      const response = await apiClient.get<ApiSuccessResponse<User>>(
        ENDPOINTS.GET
      );
      // Data is already converted to camelCase by axios interceptor
      set({ user: response.data.data });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      set({ user: null });
      throw error;
    } finally {
      if (setLoading) setLoading(false);
    }
  },

  updateUserInfo: async (formData, setLoading) => {
    if (setLoading) setLoading(true);
    try {
      // Convert UI form data to API payload using mapper
      const payload = AuthMapper.toUpdateUserPayload(formData);

      const response = await apiClient.put<ApiSuccessResponse<User>>(
        ENDPOINTS.UPDATE,
        payload
      );
      // Update user in store
      set({ user: response.data.data });
    } catch (error) {
      console.error("Failed to update user info:", error);
      throw error;
    } finally {
      if (setLoading) setLoading(false);
    }
  },

  changePassword: async (formData, setLoading) => {
    if (setLoading) setLoading(true);
    try {
      // Convert UI form data to API payload using mapper
      const payload = AuthMapper.toChangePasswordPayload(formData);

      await apiClient.put(ENDPOINTS.CHANGE_PASSWORD, payload);
    } catch (error) {
      console.error("Failed to change password:", error);
      throw error;
    } finally {
      if (setLoading) setLoading(false);
    }
  },
}));

// Hook wrapper with additional utilities
export const useProfile = () => {
  const { t } = useTranslation();
  const { setLoading, showSuccess, showError } = useApp();
  const { user, getCurrentUser, updateUserInfo, changePassword } =
    useProfileStore();

  /**
   * Update user information with error handling
   */
  const handleUpdateUserInfo = async (
    data: UpdateUserFormData,
    setIsUpdating: (loading: boolean) => void
  ) => {
    try {
      await updateUserInfo(data, setIsUpdating);
      showSuccess(t("profile.update.success"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : t("profile.update.error");
      showError(errorMessage);
      throw error;
    }
  };

  /**
   * Change user password with error handling
   */
  const handleChangePassword = async (
    data: ChangePasswordFormData,
    setIsChangingPassword: (loading: boolean) => void
  ) => {
    try {
      await changePassword(data, setIsChangingPassword);
      showSuccess(t("profile.changePassword.success"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("profile.changePassword.error");
      showError(errorMessage);
      throw error;
    }
  };

  return {
    user,
    t,
    setLoading,
    showSuccess,
    showError,
    getCurrentUser,
    handleUpdateUserInfo,
    handleChangePassword,
  };
};
