/**
 * Permission constants for RBAC system
 *
 * Permission format: resource::action
 * Hierarchy: *::* > resource::admin-action > resource::action
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
  CATEGORY: "category",
  TEST: "test",
  QUESTION: "question",
  USER: "user",
  ADMIN: "admin",
} as const;

/**
 * Action names
 */
export const ACTIONS = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
  CREATE: "create",
  UPDATE: "update",
  ADMIN_READ: "admin-read",
  ADMIN_WRITE: "admin-write",
  ADMIN_DELETE: "admin-delete",
  ADMIN_CREATE: "admin-create",
  ADMIN_UPDATE: "admin-update",
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
  CATEGORY_WRITE: buildPermission(RESOURCES.CATEGORY, ACTIONS.WRITE),
  CATEGORY_DELETE: buildPermission(RESOURCES.CATEGORY, ACTIONS.DELETE),
  CATEGORY_CREATE: buildPermission(RESOURCES.CATEGORY, ACTIONS.CREATE),
  CATEGORY_UPDATE: buildPermission(RESOURCES.CATEGORY, ACTIONS.UPDATE),
  CATEGORY_ADMIN_READ: buildPermission(RESOURCES.CATEGORY, ACTIONS.ADMIN_READ),
  CATEGORY_ADMIN_WRITE: buildPermission(
    RESOURCES.CATEGORY,
    ACTIONS.ADMIN_WRITE
  ),
  CATEGORY_ADMIN_DELETE: buildPermission(
    RESOURCES.CATEGORY,
    ACTIONS.ADMIN_DELETE
  ),
  CATEGORY_ADMIN_CREATE: buildPermission(
    RESOURCES.CATEGORY,
    ACTIONS.ADMIN_CREATE
  ),
  CATEGORY_ADMIN_UPDATE: buildPermission(
    RESOURCES.CATEGORY,
    ACTIONS.ADMIN_UPDATE
  ),

  // Test permissions
  TEST_READ: buildPermission(RESOURCES.TEST, ACTIONS.READ),
  TEST_WRITE: buildPermission(RESOURCES.TEST, ACTIONS.WRITE),
  TEST_DELETE: buildPermission(RESOURCES.TEST, ACTIONS.DELETE),
  TEST_CREATE: buildPermission(RESOURCES.TEST, ACTIONS.CREATE),
  TEST_UPDATE: buildPermission(RESOURCES.TEST, ACTIONS.UPDATE),
  TEST_ADMIN_READ: buildPermission(RESOURCES.TEST, ACTIONS.ADMIN_READ),
  TEST_ADMIN_WRITE: buildPermission(RESOURCES.TEST, ACTIONS.ADMIN_WRITE),
  TEST_ADMIN_DELETE: buildPermission(RESOURCES.TEST, ACTIONS.ADMIN_DELETE),
  TEST_ADMIN_CREATE: buildPermission(RESOURCES.TEST, ACTIONS.ADMIN_CREATE),
  TEST_ADMIN_UPDATE: buildPermission(RESOURCES.TEST, ACTIONS.ADMIN_UPDATE),

  // Question permissions
  QUESTION_READ: buildPermission(RESOURCES.QUESTION, ACTIONS.READ),
  QUESTION_WRITE: buildPermission(RESOURCES.QUESTION, ACTIONS.WRITE),
  QUESTION_DELETE: buildPermission(RESOURCES.QUESTION, ACTIONS.DELETE),
  QUESTION_CREATE: buildPermission(RESOURCES.QUESTION, ACTIONS.CREATE),
  QUESTION_UPDATE: buildPermission(RESOURCES.QUESTION, ACTIONS.UPDATE),
  QUESTION_ADMIN_READ: buildPermission(RESOURCES.QUESTION, ACTIONS.ADMIN_READ),
  QUESTION_ADMIN_WRITE: buildPermission(
    RESOURCES.QUESTION,
    ACTIONS.ADMIN_WRITE
  ),
  QUESTION_ADMIN_DELETE: buildPermission(
    RESOURCES.QUESTION,
    ACTIONS.ADMIN_DELETE
  ),
  QUESTION_ADMIN_CREATE: buildPermission(
    RESOURCES.QUESTION,
    ACTIONS.ADMIN_CREATE
  ),
  QUESTION_ADMIN_UPDATE: buildPermission(
    RESOURCES.QUESTION,
    ACTIONS.ADMIN_UPDATE
  ),

  // User permissions
  USER_READ: buildPermission(RESOURCES.USER, ACTIONS.READ),
  USER_WRITE: buildPermission(RESOURCES.USER, ACTIONS.WRITE),
  USER_DELETE: buildPermission(RESOURCES.USER, ACTIONS.DELETE),
  USER_CREATE: buildPermission(RESOURCES.USER, ACTIONS.CREATE),
  USER_UPDATE: buildPermission(RESOURCES.USER, ACTIONS.UPDATE),
  USER_ADMIN_READ: buildPermission(RESOURCES.USER, ACTIONS.ADMIN_READ),
  USER_ADMIN_WRITE: buildPermission(RESOURCES.USER, ACTIONS.ADMIN_WRITE),
  USER_ADMIN_DELETE: buildPermission(RESOURCES.USER, ACTIONS.ADMIN_DELETE),
  USER_ADMIN_CREATE: buildPermission(RESOURCES.USER, ACTIONS.ADMIN_CREATE),
  USER_ADMIN_UPDATE: buildPermission(RESOURCES.USER, ACTIONS.ADMIN_UPDATE),
} as const;
