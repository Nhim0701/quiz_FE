/**
 * Permission constants for RBAC system
 *
 * Permission format: resource::action
 * Hierarchy: *::* > resource::* > resource::action
 */

/**
 * Permission separator
 */
const PERMISSION_SEPARATOR = "::";

/**
 * Wildcard permissions
 */
export const PERMISSIONS = {
  /**
   * Full access to all resources and actions
   */
  FULL_ACCESS: "*::*",
} as const;

/**
 * Default permissions for regular users
 * Read access to categories, tests, questions (includes answers)
 * Plus access to user menu items (dashboard, user tests, profile)
 */
export const DEFAULT_USER_PERMISSIONS = [
  // Admin resource read permissions
  "categories::read",
  "tests::read",
  "questions::read",
  // User menu permissions
  "dashboard::read",
  "user_tests::read",
  "profile::read",
  "profile::update",
] as const;

/**
 * Admin resource names
 */
export const RESOURCES = {
  CATEGORY: "categories",
  TEST: "tests",
  QUESTION: "questions",
  USER: "users",
  ROLES: "roles",
  PERMISSIONS: "permissions",
  NAMESPACE: "namespaces",
} as const;

/**
 * User resource names (for user menu items)
 */
export const USER_RESOURCES = {
  DASHBOARD: "dashboard",
  USER_TESTS: "user_tests",
  PROFILE: "profile",
} as const;

/**
 * Action names
 */
export const ACTIONS = {
  READ: "read",
  DELETE: "delete",
  CREATE: "create",
  UPDATE: "update",
} as const;

/**
 * Type definitions for better type safety
 */
export type ResourceName = (typeof RESOURCES)[keyof typeof RESOURCES];
export type UserResourceName = (typeof USER_RESOURCES)[keyof typeof USER_RESOURCES];
export type ActionName = (typeof ACTIONS)[keyof typeof ACTIONS];
export type PermissionString =
  `${ResourceName}${typeof PERMISSION_SEPARATOR}${ActionName}`;
export type UserPermissionString =
  `${UserResourceName}${typeof PERMISSION_SEPARATOR}${ActionName}`;

/**
 * Helper function to build permission string
 * @param resource - Resource name
 * @param action - Action name
 * @returns Permission string in format "resource::action"
 *
 * @example
 * buildPermission(RESOURCES.CATEGORY, ACTIONS.READ) // "categories::read"
 */
export function buildPermission(
  resource: ResourceName | string,
  action: ActionName | string
): string {
  return `${resource}${PERMISSION_SEPARATOR}${action}`;
}

/**
 * Mapping from resource keys to permission prefixes
 * Handles special cases like ROLES -> ROLE, PERMISSIONS -> PERMISSION
 */
const RESOURCE_PREFIX_MAP: Record<keyof typeof RESOURCES, string> = {
  CATEGORY: "CATEGORY",
  TEST: "TEST",
  QUESTION: "QUESTION",
  USER: "USER",
  ROLES: "ROLE",
  PERMISSIONS: "PERMISSION",
  NAMESPACE: "NAMESPACE",
} as const;

/**
 * Generate all permissions for a resource
 * @param resourceKey - Key of the resource (e.g., "CATEGORY", "ROLES")
 * @param resourceValue - Value of the resource (e.g., "categories", "roles")
 * @returns Object with all permissions for the resource
 */
function generateResourcePermissions(
  resourceKey: keyof typeof RESOURCES,
  resourceValue: ResourceName
) {
  const prefix = RESOURCE_PREFIX_MAP[resourceKey];
  return {
    [`${prefix}_READ`]: buildPermission(resourceValue, ACTIONS.READ),
    [`${prefix}_DELETE`]: buildPermission(resourceValue, ACTIONS.DELETE),
    [`${prefix}_CREATE`]: buildPermission(resourceValue, ACTIONS.CREATE),
    [`${prefix}_UPDATE`]: buildPermission(resourceValue, ACTIONS.UPDATE),
  } as const;
}

/**
 * Common permission combinations
 * Auto-generated for all resources to ensure consistency and reduce duplication
 */
export const COMMON_PERMISSIONS = {
  // Category permissions
  ...generateResourcePermissions("CATEGORY", RESOURCES.CATEGORY),

  // Test permissions
  ...generateResourcePermissions("TEST", RESOURCES.TEST),

  // Question permissions
  ...generateResourcePermissions("QUESTION", RESOURCES.QUESTION),

  // User permissions
  ...generateResourcePermissions("USER", RESOURCES.USER),

  // Role permissions
  ...generateResourcePermissions("ROLES", RESOURCES.ROLES),

  // Permission permissions
  ...generateResourcePermissions("PERMISSIONS", RESOURCES.PERMISSIONS),

  // Namespace permissions
  ...generateResourcePermissions("NAMESPACE", RESOURCES.NAMESPACE),
} as const;

/**
 * User menu permission constants
 * These are for the user-facing menu items (Dashboard, Tests, Profile)
 */
export const USER_PERMISSIONS = {
  // Dashboard permissions
  DASHBOARD_READ: buildPermission(USER_RESOURCES.DASHBOARD, ACTIONS.READ),

  // User Tests permissions (for taking tests)
  USER_TESTS_READ: buildPermission(USER_RESOURCES.USER_TESTS, ACTIONS.READ),

  // Profile permissions
  PROFILE_READ: buildPermission(USER_RESOURCES.PROFILE, ACTIONS.READ),
  PROFILE_UPDATE: buildPermission(USER_RESOURCES.PROFILE, ACTIONS.UPDATE),
} as const;

/**
 * Get all permissions for a specific resource
 * @param resource - Resource name
 * @returns Object with all permissions (read, create, update, delete) for the resource
 *
 * @example
 * const categoryPerms = getResourcePermissions(RESOURCES.CATEGORY);
 * // Returns: { read: "categories::read", create: "categories::create", ... }
 */
export function getResourcePermissions(resource: ResourceName) {
  return {
    read: buildPermission(resource, ACTIONS.READ),
    create: buildPermission(resource, ACTIONS.CREATE),
    update: buildPermission(resource, ACTIONS.UPDATE),
    delete: buildPermission(resource, ACTIONS.DELETE),
  } as const;
}

/**
 * Get all CRUD permissions as an array for a specific resource
 * @param resource - Resource name
 * @returns Array of all permissions for the resource
 *
 * @example
 * const categoryPerms = getResourcePermissionsArray(RESOURCES.CATEGORY);
 * // Returns: ["categories::read", "categories::create", "categories::update", "categories::delete"]
 */
export function getResourcePermissionsArray(resource: ResourceName): string[] {
  return [
    buildPermission(resource, ACTIONS.READ),
    buildPermission(resource, ACTIONS.CREATE),
    buildPermission(resource, ACTIONS.UPDATE),
    buildPermission(resource, ACTIONS.DELETE),
  ];
}
