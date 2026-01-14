import { useEffect, useMemo, useCallback } from "react";
import { useForm, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, type TranslationParams } from "@/i18n";
import { useApp } from "@/hooks";
import { useUsersStore, type User } from "../hooks";
import { useRolesStore } from "@/modules/admin/modules/roles/hooks";
import { assignRolesSchema, type AssignRolesFormData } from "../schemas";
import { FormDialog } from "@/components/common/form-dialog";
import { ComboboxField } from "@/components/common/form-field";
import { DIALOG_MODES } from "@/constants";
import type { FormDialogMode } from "@/constants";
import { Loader2 } from "lucide-react";

interface AssignRolesDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignRolesDialog({
  user,
  open,
  onOpenChange,
}: AssignRolesDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const { assignRoles, loading } = useUsersStore();
  const { fetchRoles, roles, loading: rolesLoading } = useRolesStore();

  const mode = DIALOG_MODES.CREATE as FormDialogMode;

  const methods = useForm<AssignRolesFormData>({
    resolver: zodResolver(assignRolesSchema(t)),
    defaultValues: {
      roleId: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = methods;

  // Fetch roles when dialog opens
  useEffect(() => {
    if (open) {
      fetchRoles(1, 100);
      // Initialize with user's current roleId if available
      reset({ roleId: user?.roleId || "" });
    }
  }, [open, user, fetchRoles, reset]);

  const currentRoleId = watch("roleId");
  const canSubmit = useMemo(() => !!currentRoleId.trim(), [currentRoleId]);

  const title = useMemo(() => t("admin.users.assignRoles.title"), [t]);

  const description = useMemo(
    () =>
      user
        ? t("admin.users.assignRoles.description", {
            name: user.fullName || "",
          } as TranslationParams<"admin.users.assignRoles.description">)
        : undefined,
    [t, user]
  );

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        value: role.id,
        label: role.name,
      })),
    [roles]
  );

  const handleClose = useCallback(() => {
    reset({ roleId: "" });
    onOpenChange(false);
  }, [reset, onOpenChange]);

  const onSubmit = useCallback(
    async (data: AssignRolesFormData) => {
      if (!user) return;

      try {
        await assignRoles(user.id, data.roleId);
        showSuccess(t("admin.users.assignRoles.success"));
        handleClose();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      }
    },
    [user, assignRoles, showSuccess, showError, t, handleClose]
  );

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  if (!open) return null;

  return (
    <FormDialog
      open={open}
      onOpenChange={(open) => !open && handleClose()}
      mode={mode}
      title={title}
      description={description}
      onCancel={handleClose}
      onSubmit={handleFormSubmit}
      loading={loading || rolesLoading}
      isSubmitting={isSubmitting}
      canSubmit={canSubmit}
      createLabel={t("admin.users.assignRoles.submit")}
      cancelLabel={t("common.cancel")}
    >
      <FormProvider {...methods}>
        <Form className="mt-6 space-y-4">
          {rolesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : roles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("admin.users.assignRoles.noRoles")}
            </p>
          ) : (
            <ComboboxField
              id="roleId"
              label={t("admin.users.assignRoles.roleLabel")}
              name="roleId"
              control={control}
              options={roleOptions}
              error={errors.roleId}
              required
              disabled={loading || rolesLoading || isSubmitting}
              placeholder={t("common.selectPlaceholder")}
              searchPlaceholder={t("common.comboboxSearchPlaceholder")}
              emptyMessage={t("common.noResultsFound")}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
          )}
        </Form>
      </FormProvider>
    </FormDialog>
  );
}
