import { useState, useCallback } from "react";
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
import { RolesList, RoleForm } from "./components";
import { useRolesStore } from "./hooks";

export default function AdminRoles() {
  const { t } = useTranslation();
  const { getNamespaceRoles } = useRole();
  const { openDialog } = useRolesStore();
  const [clearFilters, setClearFilters] = useState<(() => void) | null>(null);

  const roles = getNamespaceRoles(RESOURCES.ROLES);

  useBreadcrumb(
    [
      {
        label: t("sidebar.admin.index"),
        href: "",
      },
      {
        label: t("sidebar.admin.rolesPermissions"),
        href: "",
      },
      {
        label: t("sidebar.admin.roles"),
        href: ROUTES.ROLES.INDEX,
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
        <PageHeader title={t("admin.roles.title")} />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {t("admin.common.noPermission")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="p-2">
      <PageHeader title={t("admin.roles.title")} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("admin.roles.cardTitle")}</CardTitle>
          {roles.create && (
            <Button
              onClick={() => openDialog()}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.roles.createTitle")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <RolesList
            roles={roles}
            onClearFiltersReady={handleClearFiltersReady}
          />
        </CardContent>
      </Card>
      <div className="mt-4">
        <RoleForm onClearFilters={clearFilters} />
      </div>
    </Container>
  );
}
