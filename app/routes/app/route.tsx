import ProtectedRoute from "@/middleware/protected-route";
import { Layout } from "@/components/layout";
import { redirect } from "react-router-dom";
import { tokenManager } from "@/lib/api";
import { useAuthStoreInternal } from "@/hooks/useAuth";

/**
 * Loader to check authentication before loading route
 */
export async function loader() {
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
}

export default function AppLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

