import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import useApp from "../hooks/useApp";
import ThemeToggle from "../components/ui/theme-toggle";
import { ROUTES, SESSION_KEYS } from "../constants";
import {
  LoginHeader,
  LoginForm,
  LoginCard,
  LoginFooter,
} from "../components/pages/login";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError, setLoading } = useApp();
  const [loading, setLocalLoading] = useState(false);

  // Get destination page from location.state, sessionStorage, or default to /profile
  const getRedirectPath = () => {
    // Priority 1: location.state (from ProtectedRoute)
    const fromState = (location.state as { from?: { pathname: string } })
      ?.from?.pathname;
    if (fromState) return fromState;

    // Priority 2: sessionStorage (from 401 redirect)
    const fromSession = sessionStorage.getItem(SESSION_KEYS.REDIRECT_PATH);
    if (fromSession) {
      sessionStorage.removeItem(SESSION_KEYS.REDIRECT_PATH);
      return fromSession;
    }

    // Priority 3: default
    return ROUTES.PROFILE;
  };

  const from = getRedirectPath();

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (email: string, password: string) => {
    setLocalLoading(true);
    setLoading(true);

    try {
      await login({ email, password }, setLoading);
      navigate(from, { replace: true });
    } catch (err) {
      const error = err as Error;
      const errorMessage =
        error.message || "Login failed. Please check your credentials.";
      showError(errorMessage);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <LoginHeader />
        <LoginCard>
          <LoginForm onSubmit={handleSubmit} loading={loading} />
        </LoginCard>
        <LoginFooter />
      </div>
    </div>
  );
}
