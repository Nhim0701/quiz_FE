import { redirect } from "react-router";
import type { Route } from "../modules/+types/_layout";
import { useAuthStoreInternal } from "@/hooks/useAuth";
import { ROUTES, PERMISSIONS } from "@/constants";
import { hasPermission } from "@/lib/permissions";

/**
 * Middleware to protect admin-only routes
 * Redirects to home if user is not an admin
 */
const adminMiddleware: Route.ClientMiddlewareFunction = async () => {
  const { user } = useAuthStoreInternal.getState();

  // Check if user is logged in
  if (!user) {
    throw redirect(ROUTES.LOGIN);
  }

  // Check if user has admin permission (*::*)
  if (!hasPermission(user.permissions, PERMISSIONS.FULL_ACCESS)) {
    throw redirect(ROUTES.HOME);
  }
};

export default adminMiddleware;
