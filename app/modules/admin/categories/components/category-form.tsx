import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/common/form-field";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useApp, usePaginationStore } from "@/hooks";
import { categorySchema, type CategoryFormData } from "../schemas";
import { useCategoriesStore } from "../hooks";
import { Loader2 } from "lucide-react";

interface CategoryFormProps {
  onClearFilters?: (() => void) | null;
}

export function CategoryForm({ onClearFilters }: CategoryFormProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const { page, pageSize } = usePaginationStore();
  const {
    isSheetOpen,
    editingCategory,
    closeSheet,
    createCategory,
    updateCategory,
    refreshCategories,
    loading,
  } = useCategoriesStore();
  const isEditMode = !!editingCategory;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema(t)),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name || "",
      });
    } else {
      reset({
        name: "",
      });
    }
  }, [editingCategory, reset, isSheetOpen]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditMode && editingCategory) {
        await updateCategory(editingCategory.id, data);
        showSuccess(t("admin.categories.updateSuccess"));
        closeSheet();
        await refreshCategories(page, pageSize);
      } else {
        await createCategory(data);
        showSuccess(t("admin.categories.createSuccess"));
        closeSheet();
        // Clear filters and fetch all data after create
        if (onClearFilters) {
          onClearFilters();
        }
        await refreshCategories(1, pageSize);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isEditMode
              ? t("admin.categories.editTitle")
              : t("admin.categories.createTitle")}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? t("admin.categories.editDescription")
              : t("admin.categories.createDescription")}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField
            id="name"
            label={t("admin.categories.form.nameLabel")}
            type="text"
            placeholder={t("admin.categories.form.namePlaceholder")}
            register={register("name")}
            error={errors.name}
            required
            disabled={loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeSheet}
              disabled={loading || isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || isSubmitting}
              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
            >
              {(loading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode
                ? t("admin.categories.update")
                : t("admin.categories.create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
