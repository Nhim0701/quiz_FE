import { useEffect } from "react";
import { useNavigate } from "react-router";
import { tokenManager } from "@/lib/api";
import { useAuthStoreInternal } from "@/modules/common/auth/hooks/useAuth";
import { ROUTES } from "@/constants";
import { ROUTES as AUTH_ROUTES } from "@/modules/common/auth/constants";

/**
 * Root component to check auth on app startup and redirect appropriately
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
      navigate(user ? ROUTES.DASHBOARD : AUTH_ROUTES.LOGIN, { replace: true });
    };

    checkAuthAndRedirect();
  }, [navigate]);

  return null;
}
