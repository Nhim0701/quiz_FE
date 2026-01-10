import { redirect } from "react-router";
import { useAuthStoreInternal } from "@/hooks/useAuth";
import { ROLES, ROUTES } from "@/constants";

/**
 * Middleware to protect admin-only routes
 * Redirects to home if user is not an admin
 */
export async function adminMiddleware() {
  const { user } = useAuthStoreInternal.getState();

  // Check if user is logged in
  if (!user) {
    throw redirect(ROUTES.LOGIN);
  }

  // Check if user is admin
  if (user.role !== ROLES.ADMIN) {
    throw redirect(ROUTES.HOME);
  }

  return null;
}
