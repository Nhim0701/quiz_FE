import { useEffect } from "react";
import { useNavigate } from "react-router";
import { tokenManager } from "@/lib/api";
import { useAuthStoreInternal } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";

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
          navigate(ROUTES.LOGIN, { replace: true });
          return;
        }
      }

      // Redirect based on user state
      navigate(user ? ROUTES.DASHBOARD : ROUTES.LOGIN, { replace: true });
    };

    checkAuthAndRedirect();
  }, [navigate]);

  return null;
}
