import { useState } from "react";
import { useTranslation } from "@/i18n";
import { useRole } from "@/hooks/useRole";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RESOURCES } from "@/constants/permissions";
import { TestsList, TestForm } from "./components";

export default function AdminTests() {
  const { t } = useTranslation();
  const { getNamespaceRoles } = useRole();
  const [isFormOpen, setIsFormOpen] = useState(false);

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
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("admin.tests.cardTitle")}</CardTitle>
          {roles.create && (
            <Button
              onClick={() => setIsFormOpen(true)}
              size="sm"
              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.tests.create")}
            </Button>
          )}
        </CardHeader>
        <CardContent className="overflow-auto">
          <TestsList roles={roles} />
        </CardContent>
      </Card>
      <TestForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </Container>
  );
}
