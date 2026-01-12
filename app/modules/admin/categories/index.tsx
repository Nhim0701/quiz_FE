import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { useRole } from "@/hooks/useRole";
import { RESOURCES } from "@/constants/permissions";
import { useAdminLayout } from "../_layout";
import { CategoriesList, CategoryForm } from "./components";
import { useCategoriesStore } from "@/hooks/useCategories";

export default function AdminCategories() {
  const { t } = useTranslation();
  const { getNamespaceRoles } = useRole();
  const { openSheet } = useCategoriesStore();
  const { setConfig } = useAdminLayout();
  const [clearFilters, setClearFilters] = useState<(() => void) | null>(null);

  const roles = getNamespaceRoles(RESOURCES.CATEGORY);

  const handleClearFiltersReady = useCallback((clearFiltersFn: () => void) => {
    setClearFilters(() => clearFiltersFn);
  }, []);

  useEffect(() => {
    setConfig({
      resource: RESOURCES.CATEGORY,
      titleKey: "admin.categories.title",
      cardTitleKey: "admin.categories.cardTitle",
      createKey: "admin.categories.create",
      onCreate: () => openSheet(),
      footer: <CategoryForm onClearFilters={clearFilters} />,
    });
  }, [setConfig, openSheet, clearFilters]);

  return (
    <CategoriesList
      roles={roles}
      onClearFiltersReady={handleClearFiltersReady}
    />
  );
}
