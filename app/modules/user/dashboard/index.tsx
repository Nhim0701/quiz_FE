import { useBreadcrumb } from "@/hooks/useApp";
import { usePageData } from "@/hooks/usePageData";
import { useMe } from "@/hooks/useMe";
import { useTranslation } from "@/i18n";
import { ROUTES } from "@/constants";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Stats, CategoryStats, TestStats, RecentActivity } from "./components";

export default function Dashboard() {
  const { t } = useTranslation();
  const { getDashboard } = useMe();

  useBreadcrumb([
    {
      label: t("sidebar.dashboard"),
      href: ROUTES.DASHBOARD,
    },
  ]);

  usePageData(() => getDashboard(), "errors.fetchDashboardFailed", []);

  return (
    <Container>
      <PageHeader title={t("sidebar.dashboard")} />
      <Stats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CategoryStats />
        <TestStats />
      </div>
      <div className="mt-4 sm:mt-6">
        <RecentActivity />
      </div>
    </Container>
  );
}
