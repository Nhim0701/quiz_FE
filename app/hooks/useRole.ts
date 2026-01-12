import { useAuth } from "./useAuth";
import {
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
} from "@/lib/permissions";
import { PERMISSIONS, buildPermission, ACTIONS } from "@/constants/permissions";

/**
 * Hook to check user permissions (RBAC)
 */
export function useRole() {
  const { user } = useAuth();

  /**
   * Check if user has a specific permission
   * @param permission - Permission in format "resource::action"
   */
  const hasPermission = (permission: string): boolean => {
    return checkPermission(user?.permissions, permission);
  };

  /**
   * Check if user has any of the specified permissions
   * @param permissions - Array of permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return checkAnyPermission(user?.permissions, permissions);
  };

  /**
   * Check if user has all of the specified permissions
   * @param permissions - Array of permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return checkAllPermissions(user?.permissions, permissions);
  };

  /**
   * Check if user is admin (has *::* permission)
   */
  const isAdmin = (): boolean => {
    return checkPermission(user?.permissions, PERMISSIONS.FULL_ACCESS);
  };

  /**
   * Check if user can access admin pages
   * @param resource - Resource name (e.g., "category", "test")
   */
  const canAccessAdmin = (resource?: string): boolean => {
    if (isAdmin()) return true;
    if (!resource) return false;
    return checkPermission(
      user?.permissions,
      buildPermission(resource, ACTIONS.READ)
    );
  };

  return {
    user,
    permissions: user?.permissions || [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    canAccessAdmin,
  };
}
