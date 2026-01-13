import { useState } from "react";
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
import { TestsList, TestForm } from "./components";

export default function AdminTests() {
  const { t } = useTranslation();
  const { getNamespaceRoles } = useRole();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const roles = getNamespaceRoles(RESOURCES.TEST);

  useBreadcrumb(
    [
      {
        label: t("sidebar.admin.index"),
        href: "",
      },
      {
        label: t("sidebar.admin.tests"),
        href: ROUTES.TESTS.INDEX,
      },
    ],
    [t]
  );

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
    <Container className="p-2">
      <PageHeader title={t("admin.tests.title")} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("admin.tests.cardTitle")}</CardTitle>
          {roles.create && (
            <Button
              onClick={() => setIsFormOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.tests.createTitle")}
            </Button>
          )}
        </CardHeader>
        <CardContent className="overflow-auto">
          <TestsList roles={roles} />
        </CardContent>
      </Card>
      <div className="mt-4">
        <TestForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      </div>
    </Container>
  );
}
