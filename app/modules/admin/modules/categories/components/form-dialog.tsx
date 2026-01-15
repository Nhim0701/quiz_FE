import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, type TranslationParams } from "@/i18n";
import { FormField } from "@/components/common/form-field";
import { useApp } from "@/hooks";
import {
  categorySchema,
  categoryFormBuilder,
  type CategoryFormData,
} from "../schemas";
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
  onRefresh?: () => Promise<void>;
}

/**
 * CategoryFormDialog extends FormDialog to provide category-specific form functionality.
 * It handles create, edit, and view modes for categories.
 * Mode is automatically determined from store state.
 */
export function CategoryFormDialog({
  onDelete,
  onClearFilters,
  onRefresh,
}: CategoryFormDialogProps) {
  const { t } = useTranslation();
  const {
    showError,
    showSuccess,
    showDialog,
    closeDialog: closeAppDialog,
  } = useApp();
  const {
    isDialogOpen,
    dialogMode,
    category,
    closeDialog,
    createCategory,
    updateCategory,
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
    defaultValues: categoryFormBuilder(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = methods;

  const currentValues = watch();

  useEffect(() => {
    if (shouldShow && category) {
      reset(categoryFormBuilder(category));
    } else if (shouldShow && mode === DIALOG_MODES.CREATE) {
      reset(categoryFormBuilder());
    }
  }, [shouldShow, category, mode, reset]);

  const hasChanges = category ? currentValues.name !== category.name : false;
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
    if (mode === DIALOG_MODES.CREATE) return !!currentValues.name.trim();
    if (mode === DIALOG_MODES.VIEW && isEditMode) return hasChanges;
    if (mode === DIALOG_MODES.EDIT) return true;
    return false;
  }, [mode, currentValues, isEditMode, hasChanges]);

  const onSubmit = useCallback(
    async (data: CategoryFormData) => {
      try {
        if (mode === DIALOG_MODES.CREATE) {
          await createCategory(data);
          showSuccess(t("admin.categories.createSuccess"));
          closeDialog();
          onClearFilters?.();
          onRefresh && (await onRefresh());
        } else if (category) {
          await updateCategory(category.id, data);
          showSuccess(t("admin.categories.updateSuccess"));

          if (mode === DIALOG_MODES.VIEW) {
            setEditMode(false);
          } else {
            closeDialog();
          }
          onRefresh && (await onRefresh());
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      }
    },
    [
      mode,
      createCategory,
      showSuccess,
      t,
      closeDialog,
      onClearFilters,
      onRefresh,
      category,
      updateCategory,
      setEditMode,
      showError,
    ]
  );

  const handleEdit = useCallback(() => {
    setEditMode(true);
  }, [setEditMode]);

  const handleCancel = useCallback(() => {
    if (isViewMode && isEditMode) {
      setEditMode(false);
      if (category) {
        reset(categoryFormBuilder(category));
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
