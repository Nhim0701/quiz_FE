import { useState, useCallback, useEffect } from "react";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { RESOURCES } from "@/constants/permissions";
import { useAdminLayout } from "../_layout";
import { CategoriesList, CategoryForm } from "./components";
import { useCategoriesStore } from "./hooks";

export default function AdminCategories() {
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
      createKey: "admin.categories.createTitle",
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
