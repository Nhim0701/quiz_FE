import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Loading from "./components/Loading";
import { tokenManager } from "./utils/api";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { getCurrentUser } = useAuth();

  // On mount, check if user has valid token
  useEffect(() => {
    const initAuth = async () => {
      if (tokenManager.hasToken()) {
        try {
          await getCurrentUser();
        } catch (error) {
          // Error is already handled in getCurrentUser
        }
      }
    };

    initAuth();
  }, []);

  return (
    <Router>
      <Loading />
      <AppRoutes />
    </Router>
  );
}
