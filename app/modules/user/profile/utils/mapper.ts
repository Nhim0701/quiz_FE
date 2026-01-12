// ============================================
// PROFILE MAPPER - Data transformation for profile module
// ============================================

import type { UpdateUserFormData } from "../schemas/update-user-schema";
import type { ChangePasswordFormData } from "../schemas/change-password-schema";

/**
 * Profile Mapper
 *
 * This is the ONLY place where we transform data between UI and API formats for profile module.
 *
 * Flow:
 * UI Form (camelCase) → Mapper (select/omit fields) → Axios Interceptor → Backend (snake_case)
 *
 * Note: Mapper returns camelCase objects. The axios request interceptor
 * automatically converts them to snake_case before sending to backend.
 */
export class ProfileMapper {
  /**
   * Convert update user form data to API payload
   *
   * @param formData - Data from UI form (camelCase)
   * @returns Payload object (camelCase) - axios will convert to snake_case
   */
  static toUpdateUserPayload(formData: UpdateUserFormData) {
    return {
      userId: formData.userId,
      fullName: formData.fullName,
      phone: formData.phone,
      birthday: formData.birthday,
      address: formData.address,
      jobTitle: formData.jobTitle,
      company: formData.company,
    };
  }

  /**
   * Convert change password form data to API payload
   *
   * @param formData - Data from UI form (camelCase)
   * @returns Payload object (camelCase) - axios will convert to snake_case
   *
   * Omits: confirmPassword (only used for UI validation)
   */
  static toChangePasswordPayload(formData: ChangePasswordFormData) {
    return {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      // confirmPassword is NOT sent to API - it's only for UI validation
    };
  }
}
