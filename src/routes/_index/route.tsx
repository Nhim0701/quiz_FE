import { redirect } from "react-router-dom";
import { tokenManager } from "@/lib/api";
import { useAuthStoreInternal } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";

/**
 * Root loader to check auth on app startup and redirect appropriately
 */
export async function loader() {
  let user = useAuthStoreInternal.getState().user;

  // If token exists but no user, try to fetch user
  if (tokenManager.hasToken() && !user) {
    try {
      await useAuthStoreInternal.getState().getCurrentUser();
      user = useAuthStoreInternal.getState().user;
    } catch {
      // Invalid token, redirect to login
      throw redirect("/login");
    }
  }

  // Redirect based on user state
  throw redirect(user ? ROUTES.DASHBOARD : ROUTES.LOGIN);
}
