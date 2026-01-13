import { useState } from "react";
import { useNavigate } from "react-router";
import {
  useAuth,
  type RegisterFormData,
} from "@/modules/common/auth/hooks/use-auth";
import useApp from "@/hooks/use-app";
import { useTranslation } from "@/i18n";
import { ROUTES as DASHBOARD_ROUTES } from "@/modules/user/dashboard/constants";
import {
  RegisterHeader,
  RegisterForm,
  RegisterCard,
  RegisterFooter,
} from "./components";

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
      // Navigate to dashboard after successful registration (user is already logged in with token)
      navigate(DASHBOARD_ROUTES.INDEX, { replace: true });
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
