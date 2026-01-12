import { useTranslation } from "@/i18n";
import { useRole } from "@/hooks/useRole";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RESOURCES } from "@/constants/permissions";
import { TestsList } from "./components";

export default function AdminTests() {
  const { t } = useTranslation();
  const { getNamespaceRoles } = useRole();

  // Get roles for tests namespace
  const roles = getNamespaceRoles(RESOURCES.TEST);

  if (!roles.read) {
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
          <TestsList roles={roles} />
        </CardContent>
      </Card>
    </Container>
  );
}
