import { useTranslation } from "@/i18n";
import { useRole } from "@/hooks/useRole";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMON_PERMISSIONS } from "@/constants/permissions";
import { CategoriesList } from "./components";

export default function AdminCategories() {
  const { t } = useTranslation();
  const { hasPermission } = useRole();

  // Check permission
  const canAccess = hasPermission(COMMON_PERMISSIONS.CATEGORY_ADMIN_READ);

  if (!canAccess) {
    return (
      <Container>
        <PageHeader title={t("admin.categories.title")} />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {t("admin.categories.noPermission")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title={t("admin.categories.title")} />
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.categories.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoriesList />
        </CardContent>
      </Card>
    </Container>
  );
}
