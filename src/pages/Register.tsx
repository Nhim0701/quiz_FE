import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import useApp from "../hooks/useApp";
import ThemeToggle from "../components/ui/theme-toggle";
import { LanguageSwitcher } from "../components/ui/language-switcher";
import { useTranslation } from "../i18n";
import {
  RegisterHeader,
  RegisterForm,
  RegisterCard,
  RegisterFooter,
} from "../components/pages/register";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showError, setLoading } = useApp();
  const { t } = useTranslation();
  const [loading, setLocalLoading] = useState(false);

  const handleSubmit = async (
    name: string,
    email: string,
    password: string
  ) => {
    setLocalLoading(true);
    setLoading(true);

    try {
      await register(
        {
          name,
          email,
          password,
        },
        setLoading
      );
      // Navigate to profile page after successful registration (user is already logged in with token)
      navigate("/profile");
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message || t("errors.registrationFailed");
      showError(errorMessage);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 sm:py-12 px-4">
      {/* Theme Toggle and Language Switcher - Fixed Position */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <RegisterHeader />
        <RegisterCard>
          <RegisterForm onSubmit={handleSubmit} loading={loading} />
        </RegisterCard>
        <RegisterFooter />
      </div>
    </div>
  );
}
