import { useEffect, useState } from "react";
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
import { useCategoriesStore, type Category } from "../hooks";
import { Loader2, Edit, Trash2, Save, X } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";

interface CategoryViewDialogProps {
  category: Category | null;
  onDelete: (category: Category) => void;
}

export function CategoryViewDialog({
  category,
  onDelete,
}: CategoryViewDialogProps) {
  const { t } = useTranslation();
  const {
    showError,
    showSuccess,
    showDialog,
    closeDialog: closeAppDialog,
  } = useApp();
  const { page, pageSize } = usePaginationStore();
  const {
    isDialogOpen,
    viewingCategory,
    isEditMode,
    closeDialog,
    updateCategory,
    refreshCategories,
    loading,
    setEditMode,
  } = useCategoriesStore();

  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema(t)),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (viewingCategory) {
      reset({
        name: viewingCategory.name || "",
      });
    }
  }, [viewingCategory, reset, isDialogOpen]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (viewingCategory) {
      reset({
        name: viewingCategory.name || "",
      });
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (!viewingCategory) return;

    try {
      await updateCategory(viewingCategory.id, data);
      showSuccess(t("admin.categories.updateSuccess"));
      setEditMode(false);
      await refreshCategories(page, pageSize);
      // Form will be updated via useEffect when viewingCategory changes
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  const handleDeleteClick = () => {
    if (!viewingCategory) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(viewingCategory);
        closeAppDialog();
        closeDialog();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    };

    showDialog({
      title: t("admin.categories.delete"),
      content: (
        <AlertDialogDescription>
          {(
            t as (
              key: string,
              params?: Record<string, string | number>
            ) => string
          )("admin.categories.confirmDelete", { name: viewingCategory.name })}
        </AlertDialogDescription>
      ),
      footer: (
        <AlertDialogFooterComponent>
          <AlertDialogCancel onClick={closeAppDialog}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("admin.categories.delete")}
          </AlertDialogAction>
        </AlertDialogFooterComponent>
      ),
    });
  };

  if (!viewingCategory || !isDialogOpen) return null;

  const currentName = watch("name");
  const hasChanges = currentName !== viewingCategory.name;

  return (
    <Dialog
      open={isDialogOpen && !!viewingCategory}
      onOpenChange={(open) => !open && closeDialog()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.categories.viewTitle")}</DialogTitle>
          <DialogDescription>
            {t("admin.categories.viewDescription")}
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
            disabled={!isEditMode || loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
          <DialogFooter>
            {!isEditMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium border-0"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t("common.edit")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteClick}
                  disabled={loading || isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("admin.categories.delete")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading || isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || isSubmitting || !hasChanges}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                >
                  {(loading || isSubmitting) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  {t("common.save")}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
