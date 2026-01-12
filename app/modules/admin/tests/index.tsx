import { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { useRole } from "~/modules/common/auth/hooks/useRole";
import { RESOURCES } from "@/constants/permissions";
import { useAdminLayout } from "../_layout";
import { TestsList, TestForm } from "./components";

export default function AdminTests() {
  const { t } = useTranslation();
  const { getNamespaceRoles } = useRole();
  const { setConfig } = useAdminLayout();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const roles = getNamespaceRoles(RESOURCES.TEST);

  useEffect(() => {
    setConfig({
      resource: RESOURCES.TEST,
      titleKey: "admin.tests.title",
      cardTitleKey: "admin.tests.cardTitle",
      createKey: "admin.tests.createTitle",
      onCreate: () => setIsFormOpen(true),
      showCreateButton: true,
      cardContentClassName: "overflow-auto",
      noPermissionMessage: t("admin.tests.noPermission"),
      footer: (
        <TestForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      ),
    });
  }, [setConfig, t, isFormOpen]);

  return <TestsList roles={roles} />;
}
