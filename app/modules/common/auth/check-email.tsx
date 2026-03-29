import { Mail } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/check-email";
import { useTranslation, t } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib";
import { ROUTES as AUTH_ROUTES } from "./constants";

export const meta: Route.MetaFunction = () => {
  return pageMeta(t("auth.checkEmail.title"))();
};

export default function CheckEmail() {
  const { t } = useTranslation();

  return (
    <>
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 rounded-full mb-3 sm:mb-4 shadow-lg">
          <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {t("auth.checkEmail.title")}
        </h1>
      </div>

      <Card className="shadow-xl rounded-2xl p-6 sm:p-8">
        <CardContent className="p-0 text-center space-y-5">
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {t("auth.checkEmail.subtitle")}
          </p>

          <Button asChild variant="outline" className="w-full">
            <Link to={AUTH_ROUTES.LOGIN}>{t("auth.checkEmail.backToLogin")}</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
