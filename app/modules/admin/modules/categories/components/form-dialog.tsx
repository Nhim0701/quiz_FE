import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, type TranslationParams } from "@/i18n";
import { FormField } from "@/components/common/form-field";
import { useApp, usePaginationStore } from "@/hooks";
import { categorySchema, type CategoryFormData } from "../schemas";
import { useCategoriesStore, type Category } from "../hooks";
import { FormDialog } from "@/components/common/form-dialog";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";

interface CategoryFormDialogProps {
  onDelete?: (category: Category) => void;
  onClearFilters?: (() => void) | null;
}

/**
 * CategoryFormDialog extends FormDialog to provide category-specific form functionality.
 * It handles create, edit, and view modes for categories.
 * Mode is automatically determined from store state.
 */
export function CategoryFormDialog({
  onDelete,
  onClearFilters,
}: CategoryFormDialogProps) {
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
    dialogMode,
    category,
    closeDialog,
    createCategory,
    updateCategory,
    refreshCategories,
    loading,
    isEditMode,
    setEditMode,
  } = useCategoriesStore();

  const [isDeleting, setIsDeleting] = useState(false);

  // Mode is always available when dialog is open
  const mode = (dialogMode ||
    (category ? DIALOG_MODES.VIEW : DIALOG_MODES.CREATE)) as FormDialogMode;
  const shouldShow = isDialogOpen && !!dialogMode;

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema(t)),
    defaultValues: {
      name: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = methods;

  // Reset form when category or mode changes
  useEffect(() => {
    if (shouldShow && category) {
      reset({ name: category.name || "" });
    } else if (shouldShow && mode === DIALOG_MODES.CREATE) {
      reset({ name: "" });
    }
  }, [shouldShow, category, mode, reset]);

  const currentName = watch("name");
  const hasChanges = category ? currentName !== category.name : false;
  const isViewMode = mode === DIALOG_MODES.VIEW;
  const isDisabled = isViewMode && !isEditMode;

  const title = useMemo(
    () => ({
      create: t("admin.categories.createTitle"),
      view: t("admin.categories.viewTitle"),
      edit: t("admin.categories.editTitle"),
    }),
    [t]
  );

  const description = useMemo(
    () => ({
      create: t("admin.categories.createDescription"),
      view: t("admin.categories.viewDescription"),
      edit: t("admin.categories.editDescription"),
    }),
    [t]
  );

  const canSubmit = useMemo(() => {
    if (mode === DIALOG_MODES.CREATE) return !!currentName.trim();
    if (mode === DIALOG_MODES.VIEW && isEditMode) return hasChanges;
    if (mode === DIALOG_MODES.EDIT) return true;
    return false;
  }, [mode, currentName, isEditMode, hasChanges]);

  // Helper to refresh categories after mutation
  const handleRefresh = useCallback(
    async (refreshPage: number = page) => {
      await refreshCategories(refreshPage, pageSize);
    },
    [refreshCategories, page, pageSize]
  );

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (mode === DIALOG_MODES.CREATE) {
        await createCategory(data);
        showSuccess(t("admin.categories.createSuccess"));
        closeDialog();
        onClearFilters?.();
        await handleRefresh(1);
      } else if (category) {
        // Handle both VIEW (with edit mode) and EDIT modes
        await updateCategory(category.id, data);
        showSuccess(t("admin.categories.updateSuccess"));

        if (mode === DIALOG_MODES.VIEW) {
          setEditMode(false);
        } else {
          closeDialog();
        }

        await handleRefresh();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  const handleEdit = useCallback(() => {
    setEditMode(true);
  }, [setEditMode]);

  const handleCancel = useCallback(() => {
    if (isViewMode && isEditMode) {
      setEditMode(false);
      if (category) {
        reset({ name: category.name || "" });
      }
    }
    closeDialog();
  }, [isViewMode, isEditMode, category, setEditMode, reset, closeDialog]);

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleDeleteClick = useCallback(() => {
    if (!category || !onDelete) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(category);
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
          {t("admin.categories.confirmDelete", {
            name: category.name,
          } as TranslationParams<"admin.categories.confirmDelete">)}
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
  }, [
    category,
    onDelete,
    t,
    showDialog,
    closeAppDialog,
    closeDialog,
    showError,
  ]);

  if (!shouldShow) return null;

  return (
    <FormDialog
      open={shouldShow}
      onOpenChange={(open) => !open && closeDialog()}
      mode={mode}
      isEditMode={isEditMode}
      title={title}
      description={description}
      onEdit={handleEdit}
      onDelete={onDelete ? handleDeleteClick : undefined}
      onCancel={handleCancel}
      onSubmit={handleFormSubmit}
      loading={loading}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      hasChanges={hasChanges}
      canSubmit={canSubmit}
      createLabel={t("admin.categories.create")}
      saveLabel={t("common.save")}
      editLabel={t("common.edit")}
      deleteLabel={t("admin.categories.delete")}
      cancelLabel={t("common.cancel")}
    >
      <FormProvider {...methods}>
        <Form className="mt-6 space-y-4">
          <FormField
            id="name"
            label={t("admin.categories.form.nameLabel")}
            type="text"
            placeholder={t("admin.categories.form.namePlaceholder")}
            register={register("name")}
            error={errors.name}
            required
            disabled={isDisabled || loading || isSubmitting}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
        </Form>
      </FormProvider>
    </FormDialog>
  );
}
