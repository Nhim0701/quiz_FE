import { useEffect } from "react";
import useApp from "@/hooks/useApp";
import { useMe } from "@/hooks/useMe";
import { useTranslation } from "@/i18n";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { UserInfo } from "./components";

export default function Profile() {
  const { setLoading, showError } = useApp();
  const { t } = useTranslation();
  const { getDashboard } = useMe();

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
  }, []);

  return (
    <Container>
      <PageHeader title={t("sidebar.profile")} />
      <UserInfo />
    </Container>
  );
}
