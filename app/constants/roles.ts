import type { UserRole } from "@/types/auth";

/**
 * User role constants
 */
export const ROLES = {
  ADMIN: "admin" as UserRole,
  USER: "user" as UserRole,
} as const;
