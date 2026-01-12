import { useEffect } from "react";
import useApp from "@/hooks/useApp";
import { useCategoriesStore } from "@/hooks/useCategories";
import { useTestsStore } from "@/hooks/useTests";
import { useTranslation } from "@/i18n";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { TestList } from "./components";

export default function Tests() {
  const { setLoading, showError } = useApp();
  const { t } = useTranslation();
  const { fetchCategories } = useCategoriesStore();
  const { getTestsByCategory } = useTestsStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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
      <PageHeader title={t("sidebar.tests")} />
      <TestList />
    </Container>
  );
}
