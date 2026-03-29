import { useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/register";
import {
  useAuth,
  type RegisterFormData,
} from "@/modules/common/auth/hooks/use-auth";
import { useApp } from "@/hooks";
import { useTranslation, t } from "@/i18n";
import { ROUTES as AUTH_ROUTES } from "@/modules/common/auth/constants";
import {
  RegisterHeader,
  RegisterForm,
  RegisterCard,
  RegisterFooter,
} from "./components";
import { pageMeta } from "@/lib";

export const meta: Route.MetaFunction = () => {
  return pageMeta(t("auth.register.title"))();
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showError, setLoading } = useApp();
  const { t } = useTranslation();
  const [loading, setLocalLoading] = useState(false);

  const handleSubmit = async (formData: RegisterFormData) => {
    setLocalLoading(true);
    setLoading(true);

    try {
      // Pass form data directly - useAuth will handle mapping to API payload
      await register(formData, setLoading);
      // Navigate to check-email page — account requires activation before login
      navigate(AUTH_ROUTES.CHECK_EMAIL, { replace: true });
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
    <>
      <RegisterHeader />
      <RegisterCard>
        <RegisterForm onSubmit={handleSubmit} loading={loading} />
      </RegisterCard>
      <RegisterFooter />
    </>
  );
}
