import type { ReactNode } from "react";
import { useRole } from "@/hooks/useRole";
import type { UserRole } from "@/types/auth";

interface RoleGuardProps {
  /**
   * Required role(s) to view the content
   */
  roles?: UserRole | UserRole[];
  /**
   * Only show for admin
   */
  adminOnly?: boolean;
  /**
   * Content to render if user has permission
   */
  children: ReactNode;
  /**
   * Optional fallback content if user doesn't have permission
   */
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content based on user role
 *
 * @example
 * ```tsx
 * // Show only for admins
 * <RoleGuard adminOnly>
 *   <AdminPanel />
 * </RoleGuard>
 *
 * // Show for specific roles
 * <RoleGuard roles={["admin", "moderator"]}>
 *   <ModeratorTools />
 * </RoleGuard>
 *
 * // With fallback
 * <RoleGuard adminOnly fallback={<p>Access denied</p>}>
 *   <AdminContent />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  roles,
  adminOnly,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { hasRole, hasAnyRole, isAdmin } = useRole();

  // Check admin only
  if (adminOnly && !isAdmin()) {
    return <>{fallback}</>;
  }

  // Check specific roles
  if (roles) {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    if (!hasAnyRole(roleArray)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
