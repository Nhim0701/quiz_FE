/**
 * Permission matcher for RBAC system
 *
 * Permission format: resource::action
 * Examples:
 * - "*::*" = full access to all resources and actions
 * - "category::read" = read access to category
 * - "category::*" = all actions on category resource
 * - "*::read" = read action on all resources
 *
 * Hierarchy: *::* > resource::* > resource::action
 *
 * Use constants from @/modules/admin/constants/permissions for permission strings
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
 * Cache for parsed permissions to improve performance
 */
const parseCache = new Map<string, [string, string] | null>();

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
 * Uses cache for better performance
 */
function parsePermission(permission: string): [string, string] | null {
  // Check cache first
  if (parseCache.has(permission)) {
    return parseCache.get(permission)!;
  }

  const parts = permission.split(PERMISSION_SEPARATOR);
  if (parts.length !== 2 || !parts[0]?.trim() || !parts[1]?.trim()) {
    parseCache.set(permission, null);
    return null;
  }

  const result: [string, string] = [parts[0].trim(), parts[1].trim()];
  parseCache.set(permission, result);
  return result;
}

/**
 * Check if a permission matches a required permission
 * Optimized matching logic with early returns
 */
function matchesPermission(permission: string, required: string): boolean {
  // Fast path: exact match
  if (permission === required) {
    return true;
  }

  // Fast path: full access
  if (permission === PERMISSIONS.FULL_ACCESS) {
    return true;
  }

  const parsed = parsePermission(permission);
  const requiredParsed = parsePermission(required);

  if (!parsed || !requiredParsed) {
    return false;
  }

  const [resource, action] = parsed;
  const [requiredResource, requiredAction] = requiredParsed;

  // Wildcard resource: *::action matches any resource with that action
  if (resource === WILDCARD_RESOURCE && action === requiredAction) {
    return true;
  }

  // Wildcard action: resource::* matches any action on that resource
  if (resource === requiredResource && action === WILDCARD_ACTION) {
    return true;
  }

  // Full wildcard: *::* matches everything (already checked above)
  // Exact match: resource::action === resource::action (already checked above)

  return false;
}

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
 * hasPermission(["category::*"], "category::read") // true
 * hasPermission(["*::read"], "category::read") // true
 * hasPermission(["category::read"], "category::write") // false
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  requiredPermission: string
): boolean {
  // Early return for empty permissions
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  // Early return for invalid required permission
  if (!isValidPermissionFormat(requiredPermission)) {
    return false;
  }

  // Check each user permission
  for (const permission of userPermissions) {
    if (matchesPermission(permission, requiredPermission)) {
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
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return false;
  }

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
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // Empty array means no requirements, so user "has all"
  }

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
 * hasResourcePermission(["*::*"], "categories") // true
 * hasResourcePermission(["tests::read"], "categories") // false
 */
export function hasResourcePermission(
  userPermissions: string[] | undefined,
  resourcePrefix: string
): boolean {
  // Early return for empty permissions
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  // Early return for empty resource prefix
  if (!resourcePrefix || !resourcePrefix.trim()) {
    return false;
  }

  const normalizedPrefix = resourcePrefix.trim();

  // Check for full access first (most common case)
  if (userPermissions.includes(PERMISSIONS.FULL_ACCESS)) {
    return true;
  }

  // Check each permission
  for (const permission of userPermissions) {
    const parsed = parsePermission(permission);
    if (!parsed) continue;

    const [resource] = parsed;
    // Match exact resource or wildcard resource
    if (resource === normalizedPrefix || resource === WILDCARD_RESOURCE) {
      return true;
    }
  }

  return false;
}
