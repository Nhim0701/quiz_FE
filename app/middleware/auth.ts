import { createContext, redirect } from "react-router";
import type { Route } from "../modules/+types/_layout";
import { ROUTES } from "@/constants";
import { useAuthStoreInternal, type User } from "@/hooks/useAuth";

const userContext = createContext<User | null>(null);

// Client-side authentication middleware
const authMiddleware: Route.ClientMiddlewareFunction = async ({ context }) => {
  const user = useAuthStoreInternal.getState().user;
  if (!user) {
    throw redirect(ROUTES.LOGIN);
  }

  context.set(userContext, user);
};

export default authMiddleware;
