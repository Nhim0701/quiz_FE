import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, type TranslationParams } from "@/i18n";
import { FormField } from "@/components/common/form-field";
import { useApp } from "@/hooks";
import { roleSchema, type RoleFormData } from "../schemas";
import { useRolesStore, type Role } from "../hooks";
import { FormDialog } from "@/components/common/form-dialog";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { roleFormBuilder } from "../schemas/role-schema";

interface RoleFormDialogProps {
  onDelete?: (role: Role) => void;
  onClearFilters?: (() => void) | null;
  onRefresh?: () => Promise<void>;
}

/**
 * RoleFormDialog extends FormDialog to provide role-specific form functionality.
 * It handles create, edit, and view modes for roles.
 * Mode is automatically determined from store state.
 */
export function RoleFormDialog({
  onDelete,
  onClearFilters,
  onRefresh,
}: RoleFormDialogProps) {
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
    role,
    closeDialog,
    createRole,
    updateRole,
    loading,
    isEditMode,
    setEditMode,
  } = useRolesStore();

  const [isDeleting, setIsDeleting] = useState(false);

  const mode = (dialogMode ||
    (role ? DIALOG_MODES.VIEW : DIALOG_MODES.CREATE)) as FormDialogMode;
  const shouldShow = isDialogOpen && !!dialogMode;

  const methods = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema(t)),
    defaultValues: roleFormBuilder(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = methods;

  // Reset form when role or mode changes
  useEffect(() => {
    if (shouldShow && role) {
      reset(roleFormBuilder(role));
    } else if (shouldShow && mode === DIALOG_MODES.CREATE) {
      reset(roleFormBuilder());
    }
  }, [shouldShow, role, mode, reset]);

  const currentValues = watch();
  const hasChanges = role
    ? currentValues.name !== role.name ||
      currentValues.description !== (role.description || "")
    : false;

  const isViewMode = mode === DIALOG_MODES.VIEW;
  const isDisabled = isViewMode && !isEditMode;

  const title = useMemo(
    () => ({
      create: t("admin.roles.createTitle"),
      view: t("admin.roles.viewTitle"),
      edit: t("admin.roles.editTitle"),
    }),
    [t]
  );

  const description = useMemo(
    () => ({
      create: t("admin.roles.createDescription"),
      view: t("admin.roles.viewDescription"),
      edit: t("admin.roles.editDescription"),
    }),
    [t]
  );

  const canSubmit = useMemo(() => {
    if (mode === DIALOG_MODES.CREATE) return !!currentValues.name?.trim();
    if (mode === DIALOG_MODES.VIEW && isEditMode) return hasChanges;
    if (mode === DIALOG_MODES.EDIT) return true;
    return false;
  }, [mode, currentValues, isEditMode, hasChanges]);

  const onSubmit = useCallback(
    async (data: RoleFormData) => {
      try {
        if (mode === DIALOG_MODES.CREATE) {
          await createRole(data);
          showSuccess(t("admin.roles.createSuccess"));
          closeDialog();
          onClearFilters?.();
          onRefresh && (await onRefresh());
        } else if (role) {
          await updateRole(role.id, data);
          showSuccess(t("admin.roles.updateSuccess"));

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
      createRole,
      showSuccess,
      t,
      closeDialog,
      onClearFilters,
      onRefresh,
      role,
      updateRole,
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
      if (role) {
        reset({
          name: role.name || "",
          description: role.description || "",
        });
      }
    }
    closeDialog();
  }, [isViewMode, isEditMode, role, setEditMode, reset, closeDialog]);

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleDeleteClick = useCallback(() => {
    if (!role || !onDelete) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(role);
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
      title: t("admin.roles.delete"),
      content: (
        <AlertDialogDescription>
          {t("admin.roles.confirmDelete", {
            name: role.name,
          } as TranslationParams<"admin.roles.confirmDelete">)}
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
            {t("admin.roles.delete")}
          </AlertDialogAction>
        </AlertDialogFooterComponent>
      ),
    });
  }, [role, onDelete, t, showDialog, closeAppDialog, closeDialog, showError]);

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
      createLabel={t("admin.roles.create")}
      saveLabel={t("common.save")}
      editLabel={t("common.edit")}
      deleteLabel={t("admin.roles.delete")}
      cancelLabel={t("common.cancel")}
    >
      <FormProvider {...methods}>
        <Form className="mt-6 space-y-4">
          <FormField
            id="name"
            label={t("admin.roles.form.nameLabel")}
            type="text"
            placeholder={t("admin.roles.form.namePlaceholder")}
            register={register("name")}
            error={errors.name}
            required
            disabled={isDisabled || loading || isSubmitting}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
          <FormField
            id="description"
            label={t("admin.roles.form.descriptionLabel")}
            type="text"
            placeholder={t("admin.roles.form.descriptionPlaceholder")}
            register={register("description")}
            error={errors.description}
            disabled={isDisabled || loading || isSubmitting}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
          {/* Read-only fields for view mode */}
          {isViewMode && role && (
            <>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  {t("admin.roles.form.defaultLabel")}
                </label>
                <Badge variant={role.default ? "default" : "secondary"}>
                  {role.default ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  {t("admin.roles.form.permissionsLabel")}
                </label>
                <div className="text-sm text-muted-foreground">
                  {role.permissions && role.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission, index) => (
                        <Badge key={index} variant="outline">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>
              {role.createdAt && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    {t("admin.roles.form.createdAtLabel")}
                  </label>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(role.createdAt), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              )}
              {role.updatedAt && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    {t("admin.roles.form.updatedAtLabel")}
                  </label>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(role.updatedAt), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              )}
            </>
          )}
        </Form>
      </FormProvider>
    </FormDialog>
  );
}
