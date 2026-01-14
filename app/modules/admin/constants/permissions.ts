/**
 * Permission constants for RBAC system
 *
 * Permission format: resource::action
 * Hierarchy: *::* > resource::action
 */

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
 * Resource names
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
 * Action names
 */
export const ACTIONS = {
  READ: "read",
  DELETE: "delete",
  CREATE: "create",
  UPDATE: "update",
} as const;

/**
 * Helper function to build permission string
 * @param resource - Resource name
 * @param action - Action name
 * @returns Permission string in format "resource::action"
 */
export function buildPermission(resource: string, action: string): string {
  return `${resource}::${action}`;
}

/**
 * Common permission combinations
 */
export const COMMON_PERMISSIONS = {
  // Category permissions
  CATEGORY_READ: buildPermission(RESOURCES.CATEGORY, ACTIONS.READ),
  CATEGORY_DELETE: buildPermission(RESOURCES.CATEGORY, ACTIONS.DELETE),
  CATEGORY_CREATE: buildPermission(RESOURCES.CATEGORY, ACTIONS.CREATE),
  CATEGORY_UPDATE: buildPermission(RESOURCES.CATEGORY, ACTIONS.UPDATE),

  // Test permissions
  TEST_READ: buildPermission(RESOURCES.TEST, ACTIONS.READ),
  TEST_DELETE: buildPermission(RESOURCES.TEST, ACTIONS.DELETE),
  TEST_CREATE: buildPermission(RESOURCES.TEST, ACTIONS.CREATE),
  TEST_UPDATE: buildPermission(RESOURCES.TEST, ACTIONS.UPDATE),

  // Question permissions
  QUESTION_READ: buildPermission(RESOURCES.QUESTION, ACTIONS.READ),
  QUESTION_DELETE: buildPermission(RESOURCES.QUESTION, ACTIONS.DELETE),
  QUESTION_CREATE: buildPermission(RESOURCES.QUESTION, ACTIONS.CREATE),
  QUESTION_UPDATE: buildPermission(RESOURCES.QUESTION, ACTIONS.UPDATE),

  // User permissions
  USER_READ: buildPermission(RESOURCES.USER, ACTIONS.READ),
  USER_DELETE: buildPermission(RESOURCES.USER, ACTIONS.DELETE),
  USER_CREATE: buildPermission(RESOURCES.USER, ACTIONS.CREATE),
  USER_UPDATE: buildPermission(RESOURCES.USER, ACTIONS.UPDATE),

  // Role permissions
  ROLE_READ: buildPermission(RESOURCES.ROLES, ACTIONS.READ),
  ROLE_DELETE: buildPermission(RESOURCES.ROLES, ACTIONS.DELETE),
  ROLE_CREATE: buildPermission(RESOURCES.ROLES, ACTIONS.CREATE),
  ROLE_UPDATE: buildPermission(RESOURCES.ROLES, ACTIONS.UPDATE),

  // Permission permissions
  PERMISSION_READ: buildPermission(RESOURCES.PERMISSIONS, ACTIONS.READ),
  PERMISSION_DELETE: buildPermission(RESOURCES.PERMISSIONS, ACTIONS.DELETE),
  PERMISSION_CREATE: buildPermission(RESOURCES.PERMISSIONS, ACTIONS.CREATE),
  PERMISSION_UPDATE: buildPermission(RESOURCES.PERMISSIONS, ACTIONS.UPDATE),

  // Namespace permissions
  NAMESPACE_READ: buildPermission(RESOURCES.NAMESPACE, ACTIONS.READ),
  NAMESPACE_DELETE: buildPermission(RESOURCES.NAMESPACE, ACTIONS.DELETE),
  NAMESPACE_CREATE: buildPermission(RESOURCES.NAMESPACE, ACTIONS.CREATE),
  NAMESPACE_UPDATE: buildPermission(RESOURCES.NAMESPACE, ACTIONS.UPDATE),
} as const;
