import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/common/form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
    isDialogOpen,
    editingCategory,
    viewingCategory,
    closeDialog,
    createCategory,
    updateCategory,
    refreshCategories,
    loading,
  } = useCategoriesStore();
  const isEditMode = !!editingCategory;

  // Only show this dialog when not viewing (i.e., creating or editing from create button)
  const shouldShow = isDialogOpen && !viewingCategory;

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
  }, [editingCategory, reset, isDialogOpen]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditMode && editingCategory) {
        await updateCategory(editingCategory.id, data);
        showSuccess(t("admin.categories.updateSuccess"));
        closeDialog();
        await refreshCategories(page, pageSize);
      } else {
        await createCategory(data);
        showSuccess(t("admin.categories.createSuccess"));
        closeDialog();
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
    <Dialog open={shouldShow} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("admin.categories.editTitle")
              : t("admin.categories.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("admin.categories.editDescription")
              : t("admin.categories.createDescription")}
          </DialogDescription>
        </DialogHeader>
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeDialog}
              disabled={loading || isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              {(loading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode
                ? t("admin.categories.update")
                : t("admin.categories.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
