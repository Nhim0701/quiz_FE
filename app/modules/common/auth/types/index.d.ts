// ============================================
// UI FORM DATA TYPES (camelCase - for React components)
// ============================================

/**
 * Register form data - used in UI components
 * All fields in camelCase following JavaScript conventions
 */
export interface RegisterFormData {
  email: string;
  fullName: string;
  password: string;
  confirmPassword?: string; // Optional - only needed for form validation
}

/**
 * Login form data - used in UI components
 * All fields in camelCase following JavaScript conventions
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Update user form data - used in UI components
 * All fields in camelCase following JavaScript conventions
 */
export interface UpdateUserFormData {
  userId?: string;
  fullName?: string;
  phone?: string;
  birthday?: string;
  address?: string;
  jobTitle?: string;
  company?: string;
}

/**
 * Change password form data - used in UI components
 * All fields in camelCase following JavaScript conventions
 */
export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string; // Optional - only needed for form validation
}

// ============================================
// API RESPONSE TYPES (camelCase - after transformation)
// ============================================

/**
 * Auth response from API (already transformed to camelCase by axios interceptor)
 */
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  refreshToken?: string;
}

/**
 * User data from API (already transformed to camelCase by axios interceptor)
 */
export interface User {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  permissions?: string[];
  phone?: string;
  birthday?: string;
  address?: string;
  jobTitle?: string;
  company?: string;
  joinDate?: string;
}

/**
 * User role type
 */
export type UserRole = "admin" | "user";
