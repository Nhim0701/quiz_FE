import { useEffect } from "react";
import useApp from "@/hooks/useApp";
import { useProfileStore } from "@/hooks/useProfile";
import { useTranslation } from "@/i18n";
import {
  ProfileHeader,
  ProfileStats,
} from "@/routes/app/components";

export default function Profile() {
  const { setLoading, showError } = useApp();
  const { t } = useTranslation();
  const { getDashboard } = useProfileStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await getDashboard();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.fetchDashboardFailed");
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setLoading, getDashboard, showError, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <ProfileHeader />

        <ProfileStats />
      </div>
    </div>
  );
}

