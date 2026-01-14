import { useState, useCallback } from "react";
import type { Route } from "./+types/index";
import { useTranslation } from "@/i18n";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { RESOURCES } from "@/modules/admin/constants/permissions";
import { ROUTES } from "./constants";
import { useBreadcrumb } from "@/hooks";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NamespacesList, NamespaceForm } from "./components";
import { useNamespacesStore } from "./hooks";
import { pageMeta } from "@/lib";

export const meta: Route.MetaFunction = () => {
  const { t } = useTranslation();
  return pageMeta(t("admin.namespaces.title"))();
};

export default function AdminNamespaces() {
  const { t } = useTranslation();
  const { getNamespaceRoles } = useRole();
  const { openDialog } = useNamespacesStore();
  const [clearFilters, setClearFilters] = useState<(() => void) | null>(null);

  const roles = getNamespaceRoles(RESOURCES.NAMESPACE);

  useBreadcrumb(
    [
      {
        label: t("sidebar.admin.index"),
        href: "",
      },
      {
        label: t("sidebar.admin.namespaces"),
        href: ROUTES.INDEX,
      },
    ],
    [t]
  );

  const handleClearFiltersReady = useCallback((clearFiltersFn: () => void) => {
    setClearFilters(() => clearFiltersFn);
  }, []);

  if (!roles.read) {
    return (
      <Container>
        <PageHeader title={t("admin.namespaces.title")} />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {t("admin.namespaces.noPermission")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="p-2">
      <PageHeader title={t("admin.namespaces.title")} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("admin.namespaces.cardTitle")}</CardTitle>
          {roles.create && (
            <Button
              onClick={() => openDialog()}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.namespaces.createTitle")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <NamespacesList
            roles={roles}
            onClearFiltersReady={handleClearFiltersReady}
          />
        </CardContent>
      </Card>
      <div className="mt-4">
        <NamespaceForm onClearFilters={clearFilters} />
      </div>
    </Container>
  );
}
