import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import useApp from "../hooks/useApp";
import ThemeToggle from "../components/ui/theme-toggle";
import {
  LoginHeader,
  LoginForm,
  LoginCard,
  LoginFooter,
} from "../components/login";

export default function Login() {
  const { user, login } = useAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, setLoading } = useApp();

  // Get destination page from location.state or default to /profile
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/profile";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (email: string, password: string) => {
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
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
          <LoginForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </LoginCard>
        <LoginFooter />
      </div>
    </div>
  );
}
