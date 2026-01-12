import { useAuth } from "./useAuth";
import {
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
  hasResourcePermission as checkResourcePermission,
} from "../utils/permissions";
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
   * Check if user has any permission with the specified resource prefix
   * Useful for checking namespace roles (e.g., "categories::*", "categories::read", etc.)
   * @param resourcePrefix - Resource name to check (e.g., "categories", "tests")
   */
  const hasResourcePermission = (resourcePrefix: string): boolean => {
    return checkResourcePermission(user?.permissions, resourcePrefix);
  };

  /**
   * Get roles object for a specific namespace/resource
   * Returns an object with read, create, update, delete permissions
   * @param namespace - Resource name (e.g., "categories", "tests")
   * @returns Object with boolean values for each action
   *
   * @example
   * const roles = getNamespaceRoles("categories");
   * // Returns: { read: true, create: false, update: true, delete: false }
   */
  const getNamespaceRoles = (namespace: string) => {
    const permissions = user?.permissions || [];

    // If user has full access, return all true
    if (checkPermission(permissions, PERMISSIONS.FULL_ACCESS)) {
      return {
        read: true,
        create: true,
        update: true,
        delete: true,
      };
    }

    return {
      read: checkPermission(
        permissions,
        buildPermission(namespace, ACTIONS.READ)
      ),
      create: checkPermission(
        permissions,
        buildPermission(namespace, ACTIONS.CREATE)
      ),
      update: checkPermission(
        permissions,
        buildPermission(namespace, ACTIONS.UPDATE)
      ),
      delete: checkPermission(
        permissions,
        buildPermission(namespace, ACTIONS.DELETE)
      ),
    };
  };

  return {
    user,
    permissions: user?.permissions || [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    hasResourcePermission,
    getNamespaceRoles,
  };
}
