import { Outlet, redirect } from "react-router";
import type { Route } from "../+types/_layout";
import { useAuthStoreInternal } from "@/modules/common/auth/hooks/use-auth";
import { ROUTES, PERMISSIONS, RESOURCES } from "@/constants";
import { ROUTES as AUTH_ROUTES } from "@/modules/common/auth/constants";
import { hasPermission, hasResourcePermission } from "@/lib";

/**
 * Middleware to protect admin-only routes
 * Redirects to home if user doesn't have any admin permissions
 */
const adminMiddleware: Route.ClientMiddlewareFunction = async () => {
  const { user } = useAuthStoreInternal.getState();

  // Check if user is logged in
  if (!user) {
    throw redirect(AUTH_ROUTES.LOGIN);
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

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  adminMiddleware,
];

export default function Layout() {
  return <Outlet />;
}
