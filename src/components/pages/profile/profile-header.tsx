import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";
import { useTranslation } from "../../../i18n";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants";

export function ProfileHeader() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };
  
  const displayName = user?.name || user?.email || "";

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
          {t("common.welcome", { name: displayName } as any)}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
          {user?.email}
        </p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <ThemeToggle className="flex-1 sm:flex-none" />
        <Button
          onClick={handleLogout}
          variant="outline"
          className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
        >
          {t("common.logout")}
        </Button>
      </div>
    </header>
  );
}
