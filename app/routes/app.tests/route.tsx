import { useEffect } from "react";
import useApp from "@/hooks/useApp";
import { useProfileStore } from "@/hooks/useProfile";
import { useTranslation } from "@/i18n";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { TestList } from "./components";

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
  }, []);

  return (
    <Container>
      <PageHeader title={t("sidebar.tests")} />
      <TestList />
    </Container>
  );
}
