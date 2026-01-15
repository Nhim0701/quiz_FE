import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, type TranslationParams } from "@/i18n";
import { FormField } from "@/components/common/form-field";
import { useApp, usePaginationStore } from "@/hooks";
import { namespaceSchema, type NamespaceFormData } from "../schemas";
import { useNamespacesStore, type Namespace } from "../hooks";
import { FormDialog } from "@/components/common/form-dialog";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";

interface NamespaceFormDialogProps {
  onDelete?: (namespace: Namespace) => void;
  onClearFilters?: (() => void) | null;
  onRefresh?: () => Promise<void>;
}

/**
 * NamespaceFormDialog extends FormDialog to provide namespace-specific form functionality.
 * It handles create, edit, and view modes for namespaces.
 * Mode is automatically determined from store state.
 */
export function NamespaceFormDialog({
  onDelete,
  onClearFilters,
  onRefresh,
}: NamespaceFormDialogProps) {
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
    editingNamespace,
    viewingNamespace,
    closeDialog,
    createNamespace,
    updateNamespace,
    refreshNamespaces,
    loading,
    isEditMode,
    setEditMode,
  } = useNamespacesStore();

  const [isDeleting, setIsDeleting] = useState(false);

  // Determine mode and namespace from store state
  const namespace = viewingNamespace || editingNamespace;
  const mode: FormDialogMode = useMemo(() => {
    if (viewingNamespace) return DIALOG_MODES.VIEW;
    if (editingNamespace) return DIALOG_MODES.EDIT;
    return DIALOG_MODES.CREATE;
  }, [viewingNamespace, editingNamespace]);

  const shouldShow = isDialogOpen;

  const methods = useForm<NamespaceFormData>({
    resolver: zodResolver(namespaceSchema(t)),
    defaultValues: {
      name: "",
      prefix: "",
      description: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = methods;

  // Reset form when namespace or mode changes
  useEffect(() => {
    if (shouldShow && namespace) {
      reset({
        name: namespace.name || "",
        prefix: namespace.prefix || "",
        description: namespace.description || "",
      });
    } else if (shouldShow && mode === DIALOG_MODES.CREATE) {
      reset({
        name: "",
        prefix: "",
        description: "",
      });
    }
  }, [shouldShow, namespace, mode, reset]);

  const currentData = watch();
  const hasChanges = useMemo(() => {
    if (!namespace) return false;
    return (
      currentData.name !== namespace.name ||
      currentData.prefix !== namespace.prefix ||
      currentData.description !== (namespace.description || "")
    );
  }, [currentData, namespace]);

  const isViewMode = mode === DIALOG_MODES.VIEW;
  const isDisabled = isViewMode && !isEditMode;

  const title = useMemo(
    () => ({
      create: t("admin.namespaces.createTitle"),
      view: t("admin.namespaces.viewTitle"),
      edit: t("admin.namespaces.editTitle"),
    }),
    [t]
  );

  const description = useMemo(
    () => ({
      create: t("admin.namespaces.createDescription"),
      view: t("admin.namespaces.viewDescription"),
      edit: t("admin.namespaces.editDescription"),
    }),
    [t]
  );

  const canSubmit = useMemo(() => {
    if (mode === DIALOG_MODES.CREATE) {
      return !!(currentData.name?.trim() && currentData.prefix?.trim());
    }
    if (mode === DIALOG_MODES.VIEW && isEditMode) return hasChanges;
    if (mode === DIALOG_MODES.EDIT) return true;
    return false;
  }, [mode, currentData, isEditMode, hasChanges]);

  // Helper to refresh namespaces after mutation
  const handleRefresh = useCallback(
    async (refreshPage: number = page) => {
      await refreshNamespaces(refreshPage, pageSize);
    },
    [refreshNamespaces, page, pageSize]
  );

  const onSubmit = async (data: NamespaceFormData) => {
    try {
      if (mode === DIALOG_MODES.CREATE) {
        await createNamespace(data);
        showSuccess(t("admin.namespaces.createSuccess"));
        closeDialog();
        onClearFilters?.();
        if (onRefresh) {
          await onRefresh();
        } else {
          await handleRefresh(1);
        }
      } else if (namespace) {
        // Handle both VIEW (with edit mode) and EDIT modes
        await updateNamespace(namespace.id, data);
        showSuccess(t("admin.namespaces.updateSuccess"));

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
      if (namespace) {
        reset({
          name: namespace.name || "",
          prefix: namespace.prefix || "",
          description: namespace.description || "",
        });
      }
    }
    closeDialog();
  }, [isViewMode, isEditMode, namespace, setEditMode, reset, closeDialog]);

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleDeleteClick = useCallback(() => {
    if (!namespace || !onDelete) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(namespace);
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
      title: t("admin.namespaces.delete"),
      content: (
        <AlertDialogDescription>
          {t("admin.namespaces.confirmDelete", {
            name: namespace.name,
          } as TranslationParams<"admin.namespaces.confirmDelete">)}
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
            {t("admin.namespaces.delete")}
          </AlertDialogAction>
        </AlertDialogFooterComponent>
      ),
    });
  }, [
    namespace,
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
      createLabel={t("admin.namespaces.create")}
      saveLabel={t("common.save")}
      editLabel={t("common.edit")}
      deleteLabel={t("admin.namespaces.delete")}
      cancelLabel={t("common.cancel")}
    >
      <FormProvider {...methods}>
        <Form className="mt-6 space-y-4">
          <FormField
            id="name"
            label={t("admin.namespaces.form.nameLabel")}
            type="text"
            placeholder={t("admin.namespaces.form.namePlaceholder")}
            register={register("name")}
            error={errors.name}
            required
            disabled={isDisabled || loading || isSubmitting}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
          <FormField
            id="prefix"
            label={t("admin.namespaces.form.prefixLabel")}
            type="text"
            placeholder={t("admin.namespaces.form.prefixPlaceholder")}
            register={register("prefix")}
            error={errors.prefix}
            required
            disabled={isDisabled || loading || isSubmitting}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
          <FormField
            id="description"
            label={t("admin.namespaces.form.descriptionLabel")}
            type="text"
            placeholder={t("admin.namespaces.form.descriptionPlaceholder")}
            register={register("description")}
            error={errors.description}
            disabled={isDisabled || loading || isSubmitting}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
        </Form>
      </FormProvider>
    </FormDialog>
  );
}
