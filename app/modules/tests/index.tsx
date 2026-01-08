import { useEffect } from "react";
import useApp from "@/hooks/useApp";
import { useCategoriesStore } from "@/hooks/useCategories";
import { useQuestionSetsStore } from "@/hooks/useQuestionSets";
import { useTranslation } from "@/i18n";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { TestList } from "./components";

export default function Tests() {
  const { setLoading, showError } = useApp();
  const { t } = useTranslation();
  const { getCategories } = useCategoriesStore();
  const { getQuestionSetsByCategory } = useQuestionSetsStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách categories
        await getCategories();

        // Lấy categories sau khi fetch xong
        const { categories: fetchedCategories } = useCategoriesStore.getState();

        // Lấy question sets cho từng category
        if (fetchedCategories.length > 0) {
          const questionSetsPromises = fetchedCategories.map((category) =>
            getQuestionSetsByCategory(category.id)
          );
          await Promise.all(questionSetsPromises);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <PageHeader title={t("sidebar.tests")} />
      <TestList />
    </Container>
  );
}
