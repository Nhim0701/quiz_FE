// ============================================
// AUTH MAPPER - Single source of truth for data transformation
// ============================================

import type {
  RegisterFormData,
  LoginFormData,
  UpdateUserFormData,
  ChangePasswordFormData,
} from "../types";

/**
 * Auth Mapper
 *
 * This is the ONLY place where we transform data between UI and API formats.
 *
 * Flow:
 * UI Form (camelCase) → Mapper (select/omit fields) → Axios Interceptor → Backend (snake_case)
 *
 * Why?
 * - Single source of truth for field selection
 * - Axios interceptor handles case conversion automatically
 * - Easy to maintain and test
 * - Type-safe conversions
 * - Clear separation of concerns
 *
 * Note: Mapper returns camelCase objects. The axios request interceptor
 * automatically converts them to snake_case before sending to backend.
 */
export class AuthMapper {
  /**
   * Convert register form data to API payload
   *
   * @param formData - Data from UI form (camelCase)
   * @returns Payload object (camelCase) - axios will convert to snake_case
   *
   * Omits: confirmPassword (only used for UI validation)
   */
  static toRegisterPayload(formData: RegisterFormData) {
    return {
      userEmail: formData.email,      // Backend expects user_email
      fullName: formData.fullName,
      userPassword: formData.password, // Backend expects user_password
      // confirmPassword is NOT sent to API - it's only for UI validation
    };
  }

  /**
   * Convert login form data to API payload
   *
   * @param formData - Data from UI form (camelCase)
   * @returns Payload object (camelCase) - axios will convert to snake_case
   */
  static toLoginPayload(formData: LoginFormData) {
    return {
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe ?? false,
    };
  }

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

  /**
   * Create revoke token payload
   *
   * @param refreshToken - Refresh token to revoke
   * @returns Payload object (camelCase) - axios will convert to snake_case
   */
  static toRevokeTokenPayload(refreshToken: string) {
    return {
      refreshToken: refreshToken,
    };
  }
}
