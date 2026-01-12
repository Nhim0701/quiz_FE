import { redirect } from "react-router";
import type { Route } from "../modules/+types/_layout";
import { useAuthStoreInternal } from "@/hooks/useAuth";
import {
  ROUTES,
  PERMISSIONS,
  COMMON_PERMISSIONS,
  RESOURCES,
} from "@/constants";
import {
  hasPermission,
  hasAnyPermission,
  hasResourcePermission,
} from "@/lib/permissions";

/**
 * Middleware to protect admin-only routes
 * Redirects to home if user doesn't have any admin permissions
 */
const adminMiddleware: Route.ClientMiddlewareFunction = async () => {
  const { user } = useAuthStoreInternal.getState();

  // Check if user is logged in
  if (!user) {
    throw redirect(ROUTES.LOGIN);
  }

  // Check if user has full admin access (*::*)
  if (hasPermission(user.permissions, PERMISSIONS.FULL_ACCESS)) {
    return;
  }

  // Check for namespace role prefixes (e.g., categories::*, tests::*, etc.)
  const adminResources = [
    RESOURCES.CATEGORY,
    RESOURCES.TEST,
    RESOURCES.QUESTION,
    RESOURCES.USER,
    RESOURCES.ROLES,
  ];

  const hasAnyResourcePermission = adminResources.some((resource) =>
    hasResourcePermission(user.permissions, resource)
  );

  if (!hasAnyResourcePermission) {
    throw redirect(ROUTES.HOME);
  }
};

export default adminMiddleware;
