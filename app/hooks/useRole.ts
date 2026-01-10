import { useAuth } from "./useAuth";
import type { UserRole } from "@/types/auth";
import { ROLES } from "@/constants";

/**
 * Hook to check user roles and permissions
 */
export function useRole() {
  const { user } = useAuth();

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some((role) => user?.role === role);
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return user?.role === ROLES.ADMIN;
  };

  /**
   * Check if user is regular user
   */
  const isUser = (): boolean => {
    return user?.role === ROLES.USER;
  };

  return {
    user,
    role: user?.role,
    hasRole,
    hasAnyRole,
    isAdmin,
    isUser,
  };
}
