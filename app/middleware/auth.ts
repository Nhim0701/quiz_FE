import { createContext, redirect } from "react-router";
import type { Route } from "../modules/+types/_layout";
import {
  useAuthStoreInternal,
  type User,
} from "@/modules/common/auth/hooks/use-auth";
import { ROUTES as AUTH_ROUTES } from "@/modules/common/auth/constants";
import { tokenManager } from "@/lib";

const userContext = createContext<User | null>(null);

// Client-side authentication middleware
const authMiddleware: Route.ClientMiddlewareFunction = async ({ context }) => {
  const user = useAuthStoreInternal.getState().user;

  // No persisted user → not logged in
  if (!user) throw redirect(AUTH_ROUTES.LOGIN);

  // User exists in store but token is expired/missing
  const token = tokenManager.getToken();
  if (!token || tokenManager.isTokenExpired(0)) {
    // Try to restore the session via refresh token before giving up
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      try {
        await tokenManager.attemptRefresh();
        context.set(userContext, user);
        return;
      } catch {
        // Refresh failed — clear state and redirect
      }
    }
    useAuthStoreInternal.getState().clearUser();
    tokenManager.removeToken();
    throw redirect(AUTH_ROUTES.LOGIN);
  }

  context.set(userContext, user);
};

export default authMiddleware;
