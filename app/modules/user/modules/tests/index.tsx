import type { Route } from "./+types/index";
import { useBreadcrumb, usePageData } from "@/hooks";
import { useCategoriesStore } from "../../../admin/modules/categories/hooks";
import { useTestsStore } from "@/modules/admin/modules/tests/hooks";
import { useTranslation, t } from "@/i18n";
import { ROUTES } from "./constants";
import { PageHeader } from "@/components/common/page-header";
import { Container } from "@/components/ui/container";
import { TestList } from "./components";
import { pageMeta } from "@/lib";

export const meta: Route.MetaFunction = () => {
  return pageMeta(t("sidebar.tests"))();
};

export default function Tests() {
  const { t } = useTranslation();
  const { fetchCategories } = useCategoriesStore();
  const { getTestsByCategory } = useTestsStore();

  useBreadcrumb(
    [
      {
        label: t("sidebar.tests"),
        href: ROUTES.INDEX,
      },
    ],
    [t]
  );

  usePageData(
    async () => {
      // Get categories list
      await fetchCategories(1, 100);

      // Get categories after fetching
      const { categories: fetchedCategories } = useCategoriesStore.getState();

      // Get tests for each category
      if (fetchedCategories.length > 0) {
        const testsPromises = fetchedCategories.map((category) =>
          getTestsByCategory(category.id)
        );
        await Promise.all(testsPromises);
      }
    },
    "errors.fetchDashboardFailed",
    []
  );

  return (
    <Container>
      <PageHeader title={t("sidebar.tests")} />
      <TestList />
    </Container>
  );
}
