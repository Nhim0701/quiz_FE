import { useEffect } from "react";
import { useNavigate } from "react-router";
import { tokenManager } from "@/lib";
import { useAuthStoreInternal } from "@/modules/common/auth/hooks/use-auth";
import { ROUTES as AUTH_ROUTES } from "@/modules/common/auth/constants";
import { ROUTES as DASHBOARD_ROUTES } from "@/modules/user/modules/dashboard/constants";

/**
 * Root component to check auth on app startup and redirect appropriately
 * In SPA mode, we use useEffect + navigate instead of loader
 */
export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      let user = useAuthStoreInternal.getState().user;

      // If token exists but no user, try to fetch user
      if (tokenManager.hasToken() && !user) {
        try {
          await useAuthStoreInternal.getState().getCurrentUser();
          user = useAuthStoreInternal.getState().user;
        } catch {
          // Invalid token, redirect to login
          navigate(AUTH_ROUTES.LOGIN, { replace: true });
          return;
        }
      }

      // Redirect based on user state
      navigate(user ? DASHBOARD_ROUTES.INDEX : AUTH_ROUTES.LOGIN, {
        replace: true,
      });
    };

    checkAuthAndRedirect();
  }, [navigate]);

  return null;
}
