import { createContext, redirect } from "react-router";
import type { Route } from "../modules/+types/_layout";
import {
  useAuthStoreInternal,
  type User,
} from "@/modules/common/auth/hooks/use-auth";
import { ROUTES as AUTH_ROUTES } from "@/modules/common/auth/constants";

const userContext = createContext<User | null>(null);

// Client-side authentication middleware
const authMiddleware: Route.ClientMiddlewareFunction = async ({ context }) => {
  const user = useAuthStoreInternal.getState().user;

  // If user is not logged in, redirect to login page
  if (!user) throw redirect(AUTH_ROUTES.LOGIN);
  else context.set(userContext, user);
};

export default authMiddleware;
