import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/i18n";
import { loginSchema, type LoginFormData } from "../schemas/login-schema";
import useApp from "~/hooks/useApp";
import { useState } from "react";
import { useAuth } from "~/modules/common/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  redirectPath: string;
}

export function LoginForm({ redirectPath }: LoginFormProps) {
  const { t } = useTranslation();
  const { showError, setLoading } = useApp();
  const [loading, setLocalLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema(t)),
    mode: "onChange",
    reValidateMode: "onChange",
    resetOptions: {
      keepValues: true,
    },
    defaultValues: {
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmitForm = async (data: LoginFormData) => {
    const { email, password, rememberMe } = data;
    setLocalLoading(true);
    setLoading(true);

    try {
      await login(
        { email, password, rememberMe: rememberMe ?? false },
        setLoading
      );
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message || t("errors.loginFailed");
      showError(errorMessage);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="space-y-4 sm:space-y-5"
    >
      <div>
        <Label
          htmlFor="email"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          {t("common.emailLabel")}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder={t("common.emailPlaceholder")}
          className={`w-full border ${
            errors.email
              ? "border-red-500 dark:border-red-600"
              : "border-slate-300 dark:border-slate-600"
          } dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition`}
          disabled={loading}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label
          htmlFor="password"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          {t("common.passwordLabel")}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder={t("common.passwordPlaceholder")}
          className={`w-full border ${
            errors.password
              ? "border-red-500 dark:border-red-600"
              : "border-slate-300 dark:border-slate-600"
          } dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition`}
          disabled={loading}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) =>
            setValue("rememberMe", checked === true)
          }
          disabled={loading}
        />
        <Label
          htmlFor="rememberMe"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {t("auth.login.rememberMe")}
        </Label>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? t("auth.login.signingIn") : t("auth.login.signIn")}
      </Button>
    </form>
  );
}
