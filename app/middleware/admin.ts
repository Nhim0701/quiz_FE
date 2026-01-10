import { redirect } from "react-router";
import { useAuthStoreInternal } from "@/hooks/useAuth";
import { ROLES, ROUTES } from "@/constants";

/**
 * Middleware to protect admin-only routes
 * Redirects to home if user is not an admin
 */
export async function adminMiddleware() {
  const { user } = useAuthStoreInternal.getState();

  console.log("🔒 Admin Middleware - User:", user);
  console.log("🔒 Admin Middleware - Role:", user?.role);
  console.log("🔒 Admin Middleware - Expected:", ROLES.ADMIN);

  // Check if user is logged in
  if (!user) {
    console.log("❌ No user, redirecting to login");
    throw redirect(ROUTES.LOGIN);
  }

  // Check if user is admin
  if (user.role !== ROLES.ADMIN) {
    console.log("❌ Not admin, redirecting to home. User role:", user.role);
    // Not an admin, redirect to home
    throw redirect(ROUTES.HOME);
  }

  console.log("✅ Admin check passed");
  return null;
}
