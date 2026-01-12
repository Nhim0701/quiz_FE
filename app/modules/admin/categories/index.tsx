import { useTranslation } from "@/i18n";
import { useRole } from "@/hooks/useRole";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { COMMON_PERMISSIONS } from "@/constants/permissions";
import { CategoriesList, CategoryForm } from "./components";
import { useCategoriesStore } from "@/hooks/useCategories";

export default function AdminCategories() {
  const { t } = useTranslation();
  const { hasPermission } = useRole();
  const { openSheet } = useCategoriesStore();

  // Check permission
  const canAccess = hasPermission(COMMON_PERMISSIONS.CATEGORY_READ);
  const canCreate = hasPermission(COMMON_PERMISSIONS.CATEGORY_CREATE);

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
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("admin.categories.title")}</CardTitle>
          {canCreate && (
            <Button
              onClick={() => openSheet()}
              size="sm"
              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.categories.create")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <CategoriesList />
        </CardContent>
      </Card>
      <CategoryForm />
    </Container>
  );
}
