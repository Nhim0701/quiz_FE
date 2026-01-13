/**
 * Permission matcher for RBAC system
 *
 * Permission format: resource::action
 * Examples:
 * - "*::*" = full access to all resources and actions
 * - "category::read" = read access to category
 *
 * Hierarchy: *::* > resource::action
 *
 * Use constants from @/constants/permissions for permission strings
 */

import { PERMISSIONS } from "@/modules/admin/constants/permissions";

/**
 * Permission separator
 */
const PERMISSION_SEPARATOR = "::";

/**
 * Wildcard resource indicator
 */
const WILDCARD_RESOURCE = "*";

/**
 * Wildcard action indicator
 */
const WILDCARD_ACTION = "*";

/**
 * Validate permission format: resource::action
 * Checks if permission string has correct format with non-empty resource and action
 *
 * @param permission - Permission string to validate
 * @returns true if permission has valid format (resource::action with both parts non-empty)
 *
 * @example
 * isValidPermissionFormat("users::read") // true
 * isValidPermissionFormat("users::") // false
 * isValidPermissionFormat("::read") // false
 * isValidPermissionFormat("users::read::write") // false
 */
export function isValidPermissionFormat(permission: string): boolean {
  const parts = permission.split(PERMISSION_SEPARATOR);
  return parts.length === 2 && parts[0].trim() !== "" && parts[1].trim() !== "";
}

/**
 * Parse permission string into resource and action
 */
function parsePermission(permission: string): [string, string] | null {
  const [resource, action] = permission.split(PERMISSION_SEPARATOR);
  if (!resource || !action) return null;
  return [resource, action];
}

/**
 * Permission matching strategies
 */
const matchStrategies = {
  /**
   * Exact match: permission === requiredPermission
   */
  exact: (permission: string, required: string): boolean => {
    return permission === required;
  },

  /**
   * Resource match: same resource, check action hierarchy
   */
  resource: (permission: string, required: string): boolean => {
    const parsed = parsePermission(permission);
    const requiredParsed = parsePermission(required);
    if (!parsed || !requiredParsed) return false;

    const [resource, action] = parsed;
    const [requiredResource, requiredAction] = requiredParsed;

    if (resource !== requiredResource) return false;

    // Same action
    if (action === requiredAction) return true;

    return false;
  },

  /**
   * Wildcard resource match: *::action
   */
  wildcardResource: (permission: string, required: string): boolean => {
    const parsed = parsePermission(permission);
    const requiredParsed = parsePermission(required);
    if (!parsed || !requiredParsed) return false;

    const [resource, action] = parsed;
    const [, requiredAction] = requiredParsed;

    return resource === WILDCARD_RESOURCE && action === requiredAction;
  },

  /**
   * Wildcard action match: resource::*
   */
  wildcardAction: (permission: string, required: string): boolean => {
    const parsed = parsePermission(permission);
    const requiredParsed = parsePermission(required);
    if (!parsed || !requiredParsed) return false;

    const [resource, action] = parsed;
    const [requiredResource] = requiredParsed;

    return resource === requiredResource && action === WILDCARD_ACTION;
  },
};

/**
 * Check if user has permission to access a specific scope
 *
 * @param userPermissions - Array of user permissions
 * @param requiredPermission - Required permission in format "resource::action"
 * @returns true if user has the required permission
 *
 * @example
 * hasPermission(["*::*"], "category::read") // true
 * hasPermission(["category::read"], "category::read") // true
 * hasPermission(["category::read"], "category::write") // false
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  requiredPermission: string
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  // Check for full access
  if (userPermissions.includes(PERMISSIONS.FULL_ACCESS)) {
    return true;
  }

  // Validate required permission format
  if (!parsePermission(requiredPermission)) {
    return false;
  }

  // Try each matching strategy for each user permission
  for (const permission of userPermissions) {
    if (!parsePermission(permission)) continue;

    // Try all strategies
    if (
      matchStrategies.exact(permission, requiredPermission) ||
      matchStrategies.resource(permission, requiredPermission) ||
      matchStrategies.wildcardResource(permission, requiredPermission) ||
      matchStrategies.wildcardAction(permission, requiredPermission)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user has any of the required permissions
 *
 * @param userPermissions - Array of user permissions
 * @param requiredPermissions - Array of required permissions
 * @returns true if user has at least one of the required permissions
 */
export function hasAnyPermission(
  userPermissions: string[] | undefined,
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((permission) =>
    hasPermission(userPermissions, permission)
  );
}

/**
 * Check if user has all of the required permissions
 *
 * @param userPermissions - Array of user permissions
 * @param requiredPermissions - Array of required permissions
 * @returns true if user has all of the required permissions
 */
export function hasAllPermissions(
  userPermissions: string[] | undefined,
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((permission) =>
    hasPermission(userPermissions, permission)
  );
}

/**
 * Check if user has any permission with the specified resource prefix
 * Useful for checking namespace roles (e.g., "categories::*", "categories::read", etc.)
 *
 * @param userPermissions - Array of user permissions
 * @param resourcePrefix - Resource name to check (e.g., "categories", "tests")
 * @returns true if user has any permission with the resource prefix
 *
 * @example
 * hasResourcePermission(["categories::*"], "categories") // true
 * hasResourcePermission(["categories::read"], "categories") // true
 * hasResourcePermission(["tests::read"], "categories") // false
 */
export function hasResourcePermission(
  userPermissions: string[] | undefined,
  resourcePrefix: string
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  // Check for full access
  if (userPermissions.includes(PERMISSIONS.FULL_ACCESS)) {
    return true;
  }

  // Check if any permission starts with the resource prefix
  for (const permission of userPermissions) {
    const parsed = parsePermission(permission);
    if (!parsed) continue;

    const [resource] = parsed;
    // Match exact resource or wildcard resource
    if (resource === resourcePrefix || resource === WILDCARD_RESOURCE) {
      return true;
    }
  }

  return false;
}
