// ============================================
// PROFILE TYPES
// ============================================

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
