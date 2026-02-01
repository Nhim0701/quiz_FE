import type { Route } from "./+types/index";
import { useBreadcrumb, usePageData, useApp } from "@/hooks";
import { useTranslation, t } from "@/i18n";
import { ROUTES } from "./constants";
import { PageHeader } from "@/components/common/page-header";
import { Container } from "@/components/ui/container";
import { useDashboard } from "./hooks";
import {
  Stats,
  CategoryStats,
  TestStats,
  SubmissionHistory,
  DashboardSkeleton,
} from "./components";
import { pageMeta } from "@/lib";

export const meta: Route.MetaFunction = () => {
  return pageMeta(t("sidebar.dashboard"))();
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { getDashboard, dashboardData } = useDashboard();
  const { loading } = useApp();

  useBreadcrumb(
    [
      {
        label: t("sidebar.dashboard"),
        href: ROUTES.INDEX,
      },
    ],
    [t]
  );

  usePageData(() => getDashboard(), {
    errorKey: "errors.fetchDashboardFailed",
    showLoading: false,
  });

  const isLoading = loading || !dashboardData;

  return (
    <Container>
      <PageHeader title={t("sidebar.dashboard")} />
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <Stats />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <CategoryStats />
            <TestStats />
          </div>
          <div className="mt-4 sm:mt-6">
            <SubmissionHistory />
          </div>
        </>
      )}
    </Container>
  );
}

export default Dashboard;