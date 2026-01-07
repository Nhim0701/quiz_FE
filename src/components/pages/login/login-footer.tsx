import { useTranslation } from "../../../i18n";

export function LoginFooter() {
  const { t } = useTranslation();
  return (
    <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-5 sm:mt-6">
      {t("auth.login.footer")}
    </p>
  );
}

