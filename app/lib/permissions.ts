/**
 * Permission matcher for RBAC system
 * 
 * Permission format: resource::action
 * Examples:
 * - "*::*" = full access to all resources and actions
 * - "category::admin-read" = admin read access to category
 * - "category::read" = read access to category
 * 
 * Hierarchy: *::* > resource::admin-action > resource::action
 * 
 * Use constants from @/constants/permissions for permission strings
 */

import { PERMISSIONS, ACTIONS } from "@/constants/permissions";

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
 * Admin action prefix
 */
const ADMIN_PREFIX = "admin-";

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

    // Admin action can access base action: category::admin-read -> category::read
    if (action.startsWith(ADMIN_PREFIX) && requiredAction === action.replace(ADMIN_PREFIX, "")) {
      return true;
    }

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
 * hasPermission(["category::admin-read"], "category::read") // true
 * hasPermission(["category::read"], "category::write") // false
 * hasPermission(["category::admin-read"], "category::admin-write") // false
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
