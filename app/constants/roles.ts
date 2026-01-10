import type { UserRole } from "@/types/auth";

/**
 * User role constants
 */
export const ROLES = {
  ADMIN: "admin" as UserRole,
  USER: "user" as UserRole,
} as const;

/**
 * Role display names for UI
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  user: "User",
} as const;
