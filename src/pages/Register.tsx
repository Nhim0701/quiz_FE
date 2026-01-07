import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import useApp from "../hooks/useApp";
import ThemeToggle from "../components/ui/theme-toggle";
import {
  RegisterHeader,
  RegisterForm,
  RegisterCard,
  RegisterFooter,
} from "../components/register";

export default function Register() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();
  const { loading, setLoading } = useApp();

  const handleSubmit = async (name: string, email: string, password: string) => {
    setError("");
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
      });
      // Navigate to profile page after successful registration (user is already logged in with token)
      navigate("/profile");
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 sm:py-12 px-4">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <RegisterHeader />
        <RegisterCard>
          <RegisterForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </RegisterCard>
        <RegisterFooter />
      </div>
    </div>
  );
}
