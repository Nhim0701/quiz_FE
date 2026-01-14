import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, type TranslationParams } from "@/i18n";
import { FormField, ComboboxField } from "@/components/common/form-field";
import { useApp, usePaginationStore, usePageData } from "@/hooks";
import { permissionSchema, type PermissionFormData } from "../schemas";
import { usePermissionsStore, type Permission } from "../hooks";
import { useRolesStore } from "../../roles/hooks";
import { FormDialog } from "@/components/common/form-dialog";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES, MAX_PAGE_SIZE_FOR_ALL } from "@/constants";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";

interface PermissionFormDialogProps {
  onDelete?: (permission: Permission) => void;
  onClearFilters?: (() => void) | null;
}

/**
 * PermissionFormDialog extends FormDialog to provide permission-specific form functionality.
 * It handles create, edit, and view modes for permissions.
 * Mode is automatically determined from store state.
 */
export function PermissionFormDialog({
  onDelete,
  onClearFilters,
}: PermissionFormDialogProps) {
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
    editingPermission,
    viewingPermission,
    closeDialog,
    createPermission,
    updatePermission,
    refreshPermissions,
    loading,
    isEditMode,
    setEditMode,
  } = usePermissionsStore();
  const { fetchRoles, roles } = useRolesStore();

  const [isDeleting, setIsDeleting] = useState(false);

  // Determine mode and permission from store state
  const permission = viewingPermission || editingPermission;
  const mode: FormDialogMode = useMemo(() => {
    if (viewingPermission) return DIALOG_MODES.VIEW;
    if (editingPermission) return DIALOG_MODES.EDIT;
    return DIALOG_MODES.CREATE;
  }, [viewingPermission, editingPermission]);

  const shouldShow = isDialogOpen;

  // Fetch roles when dialog opens
  usePageData(() => fetchRoles(1, MAX_PAGE_SIZE_FOR_ALL), {
    errorKey: "errors.fetchRolesFailed",
    showLoading: false,
    showError: false,
    deps: [shouldShow],
  });

  const methods = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema(t)),
    defaultValues: {
      name: "",
      permission: "",
      description: "",
      roleId: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = methods;

  // Reset form when permission or mode changes
  useEffect(() => {
    if (shouldShow && permission) {
      reset({
        name: permission.name || "",
        permission: permission.permission || "",
        description: permission.description || "",
        roleId: permission.roleId || "",
      });
    } else if (shouldShow && mode === DIALOG_MODES.CREATE) {
      reset({
        name: "",
        permission: "",
        description: "",
        roleId: "",
      });
    }
  }, [shouldShow, permission, mode, reset]);

  const currentData = watch();
  const hasChanges = useMemo(() => {
    if (!permission) return false;
    return (
      currentData.name !== permission.name ||
      currentData.permission !== permission.permission ||
      currentData.description !== (permission.description || "") ||
      currentData.roleId !== (permission.roleId || "")
    );
  }, [currentData, permission]);

  const isViewMode = mode === DIALOG_MODES.VIEW;
  const isDisabled = isViewMode && !isEditMode;

  const title = useMemo(
    () => ({
      create: t("admin.permissions.createTitle"),
      view: t("admin.permissions.viewTitle"),
      edit: t("admin.permissions.editTitle"),
    }),
    [t]
  );

  const description = useMemo(
    () => ({
      create: t("admin.permissions.createDescription"),
      view: t("admin.permissions.viewDescription"),
      edit: t("admin.permissions.editDescription"),
    }),
    [t]
  );

  const canSubmit = useMemo(() => {
    if (mode === DIALOG_MODES.CREATE) {
      return !!(
        currentData.name?.trim() &&
        currentData.permission?.trim() &&
        currentData.roleId?.trim()
      );
    }
    if (mode === DIALOG_MODES.VIEW && isEditMode) return hasChanges;
    if (mode === DIALOG_MODES.EDIT) return true;
    return false;
  }, [mode, currentData, isEditMode, hasChanges]);

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        value: role.id,
        label: role.name,
      })),
    [roles]
  );

  // Helper to refresh permissions after mutation
  const handleRefresh = useCallback(
    async (refreshPage: number = page) => {
      await refreshPermissions(refreshPage, pageSize);
    },
    [refreshPermissions, page, pageSize]
  );

  const onSubmit = async (data: PermissionFormData) => {
    try {
      const submitData = {
        name: data.name,
        permission: data.permission,
        description: data.description || undefined,
        roleId: data.roleId,
      };

      if (mode === DIALOG_MODES.CREATE) {
        await createPermission(submitData);
        showSuccess(t("admin.permissions.createSuccess"));
        closeDialog();
        onClearFilters?.();
        await handleRefresh(1);
      } else if (permission) {
        // Handle both VIEW (with edit mode) and EDIT modes
        await updatePermission(permission.id, submitData);
        showSuccess(t("admin.permissions.updateSuccess"));

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
      if (permission) {
        reset({
          name: permission.name || "",
          permission: permission.permission || "",
          description: permission.description || "",
          roleId: permission.roleId || "",
        });
      }
    }
    closeDialog();
  }, [isViewMode, isEditMode, permission, setEditMode, reset, closeDialog]);

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleDeleteClick = useCallback(() => {
    if (!permission || !onDelete) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(permission);
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
      title: t("admin.permissions.delete"),
      content: (
        <AlertDialogDescription>
          {t("admin.permissions.confirmDelete", {
            name: permission.name,
          } as TranslationParams<"admin.permissions.confirmDelete">)}
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
            {t("admin.permissions.delete")}
          </AlertDialogAction>
        </AlertDialogFooterComponent>
      ),
    });
  }, [
    permission,
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
      createLabel={t("admin.permissions.create")}
      saveLabel={t("common.save")}
      editLabel={t("common.edit")}
      deleteLabel={t("admin.permissions.delete")}
      cancelLabel={t("common.cancel")}
    >
      <FormProvider {...methods}>
        <Form className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              id="name"
              label={t("admin.permissions.form.nameLabel")}
              type="text"
              placeholder={t("admin.permissions.form.namePlaceholder")}
              register={register("name")}
              error={errors.name}
              required
              disabled={isDisabled || loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="permission"
              label={t("admin.permissions.form.permissionLabel")}
              type="text"
              placeholder={t("admin.permissions.form.permissionPlaceholder")}
              register={register("permission")}
              error={errors.permission}
              required
              disabled={isDisabled || loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <ComboboxField
              id="roleId"
              label={t("admin.permissions.form.roleLabel")}
              name="roleId"
              control={control}
              options={roleOptions}
              error={errors.roleId}
              required
              disabled={isDisabled || loading || isSubmitting}
              placeholder={t("admin.permissions.form.selectRole")}
              searchPlaceholder={t("admin.permissions.form.searchRole")}
              emptyMessage={t("admin.permissions.form.noRoleFound")}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="description"
              label={t("admin.permissions.form.descriptionLabel")}
              type="text"
              placeholder={t("admin.permissions.form.descriptionPlaceholder")}
              register={register("description")}
              error={errors.description}
              disabled={isDisabled || loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
          </div>
        </Form>
      </FormProvider>
    </FormDialog>
  );
}
