import { useTranslation } from "@/i18n";
import { useRole } from "@/hooks/useRole";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMON_PERMISSIONS } from "@/constants/permissions";
import { TestsList } from "./components";

export default function AdminTests() {
  const { t } = useTranslation();
  const { hasPermission } = useRole();

  // Check permission
  const canAccess = hasPermission(COMMON_PERMISSIONS.TEST_READ);

  if (!canAccess) {
    return (
      <Container>
        <PageHeader title={t("admin.tests.title")} />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {t("admin.tests.noPermission")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title={t("admin.tests.title")} />
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.tests.title")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <TestsList />
        </CardContent>
      </Card>
    </Container>
  );
}
