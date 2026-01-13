import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/common/form-field";
import { useTranslation } from "@/i18n";
import { registerSchema, type RegisterFormData } from "../schemas";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function RegisterForm({ onSubmit, loading = false }: RegisterFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema(t)),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmitForm = async (data: RegisterFormData) => {
    await onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="space-y-3.5 sm:space-y-4"
    >
      <FormField
        id="fullName"
        label={t("auth.register.nameLabel")}
        type="text"
        placeholder={t("auth.register.namePlaceholder")}
        register={register("fullName")}
        error={errors.fullName}
        disabled={loading}
        labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition"
      />

      <FormField
        id="email"
        label={t("common.emailLabel")}
        type="email"
        placeholder={t("common.emailPlaceholder")}
        register={register("email")}
        error={errors.email}
        disabled={loading}
        labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition"
      />

      <FormField
        id="password"
        label={t("common.passwordLabel")}
        type="password"
        placeholder={t("common.passwordPlaceholder")}
        register={register("password")}
        error={errors.password}
        disabled={loading}
        labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition"
      />

      <FormField
        id="confirmPassword"
        label={t("auth.register.confirmPasswordLabel")}
        type="password"
        placeholder={t("common.passwordPlaceholder")}
        register={register("confirmPassword")}
        error={errors.confirmPassword}
        disabled={loading}
        labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition"
      />

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 hover:from-purple-700 hover:to-indigo-700 dark:hover:from-purple-600 dark:hover:to-indigo-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mt-5 sm:mt-6 disabled:transform-none"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading
          ? t("auth.register.creatingAccount")
          : t("auth.register.createAccount")}
      </Button>
    </form>
  );
}
