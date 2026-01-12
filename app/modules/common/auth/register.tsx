import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, type RegisterFormData } from "~/modules/common/auth/hooks/useAuth";
import useApp from "@/hooks/useApp";
import { useTranslation } from "@/i18n";
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
    <>
      <RegisterHeader />
      <RegisterCard>
        <RegisterForm onSubmit={handleSubmit} loading={loading} />
      </RegisterCard>
      <RegisterFooter />
    </>
  );
}
