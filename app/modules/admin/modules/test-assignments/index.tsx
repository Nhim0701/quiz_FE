import type { Route } from "./+types/index";
import { useTranslation, t } from "@/i18n";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { RESOURCES } from "@/modules/admin/constants/permissions";
import { ROUTES } from "./constants";
import { useBreadcrumb } from "@/hooks";
import { PageHeader } from "@/components/common/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TestAssignmentsList } from "./components";
import { useTestAssignmentsStore } from "./hooks";
import { pageMeta } from "@/lib";
import { DIALOG_MODES } from "@/constants";

export const meta: Route.MetaFunction = () => {
  return pageMeta(t("admin.testAssignments.title"))();
};

export default function AdminTestAssignments() {
  const { t } = useTranslation();
  const { getNamespaceRoles } = useRole();
  const { openDialog } = useTestAssignmentsStore();

  const roles = getNamespaceRoles(RESOURCES.TEST_ASSIGNMENT);

  useBreadcrumb(
    [
      {
        label: t("sidebar.admin.index"),
        href: "",
      },
      {
        label: t("sidebar.admin.testAssignments"),
        href: ROUTES.INDEX,
      },
    ],
    [t]
  );

  if (!roles.read) {
    return (
      <Container>
        <PageHeader title={t("admin.testAssignments.title")} />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {t("admin.testAssignments.noPermission")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="p-2">
      <PageHeader title={t("admin.testAssignments.title")} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("admin.testAssignments.cardTitle")}</CardTitle>
          {roles.create && (
            <Button
              onClick={() => openDialog(DIALOG_MODES.CREATE)}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.testAssignments.createTitle")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <TestAssignmentsList roles={roles} />
        </CardContent>
      </Card>
    </Container>
  );
}
