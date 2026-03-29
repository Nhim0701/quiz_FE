import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/activate";
import { useTranslation, t } from "@/i18n";
import { apiClient } from "@/lib";
import type { ApiSuccessResponse } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { ENDPOINTS, ROUTES as AUTH_ROUTES } from "./constants";
import { pageMeta } from "@/lib";

export const meta: Route.MetaFunction = () => {
  return pageMeta(t("auth.activate.title"))();
};

type ActivateState = "loading" | "success" | "error";

export default function Activate() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<ActivateState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState("error");
      setErrorMessage(t("auth.activate.noToken"));
      return;
    }

    apiClient
      .post<ApiSuccessResponse<{ message: string }>>(ENDPOINTS.ACTIVATE, {
        token,
      })
      .then(() => {
        setState("success");
      })
      .catch((err: Error) => {
        setState("error");
        // err.message contains the API detail extracted by axios interceptor,
        // or a network-level message — fall back to generic if empty
        setErrorMessage(err.message || t("auth.activate.genericError"));
      });
  }, []);

  return (
    <>
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          {t("auth.activate.title")}
        </h1>
      </div>

      <Card className="shadow-xl rounded-2xl p-6 sm:p-8">
        <CardContent className="p-0 text-center space-y-5">
          {state === "loading" && (
            <>
              <Loader2 className="w-12 h-12 mx-auto text-purple-600 animate-spin" />
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                {t("auth.activate.loading")}
              </p>
            </>
          )}

          {state === "success" && (
            <>
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                {t("auth.activate.success")}
              </p>
              <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md">
                <Link to={AUTH_ROUTES.LOGIN}>{t("auth.activate.goToLogin")}</Link>
              </Button>
            </>
          )}

          {state === "error" && (
            <>
              <XCircle className="w-12 h-12 mx-auto text-red-500" />
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                {errorMessage}
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to={AUTH_ROUTES.LOGIN}>{t("auth.activate.backToLogin")}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
