import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Save current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
