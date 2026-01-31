import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, type TranslationParams } from "@/i18n";
import { FormField, ComboboxField } from "@/components/common/form-field";
import { useApp, usePageData } from "@/hooks";
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
import { permissionFormBuilder } from "../schemas/permission-schema";

interface PermissionFormDialogProps {
  onDelete?: (permission: Permission) => void;
  onClearFilters?: (() => void) | null;
  onRefresh?: () => Promise<void>;
}

/**
 * PermissionFormDialog extends FormDialog to provide permission-specific form functionality.
 * It handles create, edit, and view modes for permissions.
 * Mode is automatically determined from store state.
 */
export function PermissionFormDialog({
  onDelete,
  onClearFilters,
  onRefresh,
}: PermissionFormDialogProps) {
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
    permission,
    closeDialog,
    createPermission,
    updatePermission,
    loading,
    isEditMode,
    setEditMode,
  } = usePermissionsStore();
  const { fetchRoles, roles } = useRolesStore();

  const [isDeleting, setIsDeleting] = useState(false);

  const mode = (dialogMode ||
    (permission ? DIALOG_MODES.VIEW : DIALOG_MODES.CREATE)) as FormDialogMode;
  const shouldShow = isDialogOpen && !!dialogMode;

  usePageData(() => fetchRoles(1, MAX_PAGE_SIZE_FOR_ALL), {
    errorKey: "errors.fetchRolesFailed",
    showLoading: false,
    showError: false,
    onError: (error) => {
      console.error("Failed to fetch roles:", error);
    },
  });

  const methods = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema(t)),
    defaultValues: permissionFormBuilder(),
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
      reset(permissionFormBuilder(permission));
    } else if (shouldShow && mode === DIALOG_MODES.CREATE) {
      reset(permissionFormBuilder());
    }
  }, [shouldShow, permission, mode, reset]);

  const currentValues = watch();
  const hasChanges = permission
    ? currentValues.name !== permission.name ||
      currentValues.permission !== permission.permission ||
      currentValues.description !== (permission.description || "") ||
      currentValues.roleId !== (permission.roleId || "")
    : false;

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

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        value: role.id,
        label: role.name,
      })),
    [roles]
  );

  const canSubmit = useMemo(() => {
    if (mode === DIALOG_MODES.CREATE) {
      return !!(
        currentValues.name?.trim() &&
        currentValues.permission?.trim() &&
        currentValues.roleId?.trim()
      );
    }
    if (mode === DIALOG_MODES.VIEW && isEditMode) return hasChanges;
    if (mode === DIALOG_MODES.EDIT) return true;
    return false;
  }, [mode, currentValues, isEditMode, hasChanges]);

  const onSubmit = useCallback(
    async (data: PermissionFormData) => {
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
          onRefresh && (await onRefresh());
        } else if (permission) {
          await updatePermission(permission.id, submitData);
          showSuccess(t("admin.permissions.updateSuccess"));

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
      createPermission,
      showSuccess,
      t,
      closeDialog,
      onClearFilters,
      onRefresh,
      permission,
      updatePermission,
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
