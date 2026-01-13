import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ROUTES as DASHBOARD_ROUTES } from "@/modules/user/modules/dashboard/constants";
import { useTranslation } from "@/i18n";

export function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Illustration */}
        <div className="flex justify-center">
          <img
            src="/svg/not-found.svg"
            alt="404 Not Found"
            className="w-full max-w-md h-auto"
          />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">
            {t("notFound.title")}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {t("notFound.description")}
          </p>
        </div>

        {/* Action button */}
        <div className="pt-4">
          <Button
            onClick={() => navigate(DASHBOARD_ROUTES.INDEX)}
            size="lg"
            className="px-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            {t("notFound.backToDashboard")}
          </Button>
        </div>
      </div>
    </div>
  );
}
