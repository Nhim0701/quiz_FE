import { useState } from "react";
import { useTranslation } from "@/i18n";
import { useRole } from "@/hooks/useRole";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RESOURCES } from "@/constants/permissions";
import { CategoriesList, CategoryForm } from "./components";
import { useCategoriesStore } from "@/hooks/useCategories";

export default function AdminCategories() {
  const { t } = useTranslation();
  const { getNamespaceRoles } = useRole();
  const { openSheet } = useCategoriesStore();
  const [clearFilters, setClearFilters] = useState<(() => void) | null>(null);

  // Get roles for categories namespace
  const roles = getNamespaceRoles(RESOURCES.CATEGORY);

  const handleClearFiltersReady = (clearFiltersFn: () => void) => {
    setClearFilters(() => clearFiltersFn);
  };

  return (
    <Container>
      <PageHeader title={t("admin.categories.title")} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("admin.categories.title")}</CardTitle>
          {roles.create && (
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
          <CategoriesList
            roles={roles}
            onClearFiltersReady={handleClearFiltersReady}
          />
        </CardContent>
      </Card>
      <CategoryForm onClearFilters={clearFilters} />
    </Container>
  );
}
