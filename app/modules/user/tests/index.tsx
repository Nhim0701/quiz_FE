import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { usePageData } from "@/hooks/use-page-data";
import { useCategoriesStore } from "../../admin/categories/hooks";
import { useTestsStore } from "@/hooks/use-tests";
import { useTranslation } from "@/i18n";
import { ROUTES } from "./constants";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { TestList } from "./components";

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
