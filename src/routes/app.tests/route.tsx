import { useEffect } from "react";
import useApp from "@/hooks/useApp";
import { useProfileStore } from "@/hooks/useProfile";
import { useTranslation } from "@/i18n";
import { PageHeader } from "@/components/page-header";
import { Tests as TestsComponent } from "./components";

export default function Tests() {
  const { setLoading, showError } = useApp();
  const { t } = useTranslation();
  const { getCategoriesWithSets } = useProfileStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await getCategoriesWithSets();
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
  }, [setLoading, getCategoriesWithSets, showError, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <PageHeader title={t("sidebar.tests")} />
        <TestsComponent />
      </div>
    </div>
  );
}
