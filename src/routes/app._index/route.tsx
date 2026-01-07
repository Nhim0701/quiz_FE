import { useEffect } from "react";
import useApp from "@/hooks/useApp";
import { useProfileStore } from "@/hooks/useProfile";
import { useTranslation } from "@/i18n";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Stats, CategoryStats, RecentActivity } from "./components";

export default function Dashboard() {
  const { setLoading, showError } = useApp();
  const { t } = useTranslation();
  const { getDashboard, getCategoriesWithSets } = useProfileStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([getCategoriesWithSets(), getDashboard()]);
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
  }, []);

  return (
    <Container>
      <PageHeader title={t("sidebar.dashboard")} />
      <Stats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CategoryStats />
        <RecentActivity />
      </div>
    </Container>
  );
}
