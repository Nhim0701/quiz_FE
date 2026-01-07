import {
  createBrowserRouter,
  Navigate,
  RouteObject,
  redirect,
} from "react-router-dom";
import { tokenManager } from "../lib/api";
import { useAuthStoreInternal } from "../hooks/useAuth";
import { Login, Register, Profile, Dashboard, Tests, Test, Result } from "../pages";
import ProtectedRoute from "../middleware/protected-route";
import { Layout } from "../components/layout";

/**
 * Loader to check authentication before loading route
 */
const protectedLoader = async () => {
  const user = useAuthStoreInternal.getState().user;
  if (!user && tokenManager.hasToken()) {
    // If token exists but no user, try to fetch user
    try {
      await useAuthStoreInternal.getState().getCurrentUser();
      return null;
    } catch {
      throw redirect("/login");
    }
  }
  if (!user) {
    throw redirect("/login");
  }
  return null;
};

/**
 * Root loader to check auth on app startup and redirect appropriately
 */
const rootLoader = async () => {
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
  throw redirect(user ? "/dashboard" : "/login");
};

const routes: RouteObject[] = [
  {
    path: "/",
    loader: rootLoader,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    loader: protectedLoader,
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/tests",
    loader: protectedLoader,
    element: (
      <ProtectedRoute>
        <Layout>
          <Tests />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    loader: protectedLoader,
    element: (
      <ProtectedRoute>
        <Layout>
          <Profile />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/test",
    loader: protectedLoader,
    element: (
      <ProtectedRoute>
        <Test />
      </ProtectedRoute>
    ),
  },
  {
    path: "/result",
    loader: protectedLoader,
    element: (
      <ProtectedRoute>
        <Result />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export const router = createBrowserRouter(routes);
