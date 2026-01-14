import { useMemo, useCallback } from "react";
import { useForm, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, type TranslationParams } from "@/i18n";
import { useApp } from "@/hooks";
import { useUsersStore, type User } from "../hooks";
import { changePasswordSchema, type ChangePasswordFormData } from "../schemas";
import { FormDialog } from "@/components/common/form-dialog";
import { FormField } from "@/components/common/form-field";
import { DIALOG_MODES } from "@/constants";
import type { FormDialogMode } from "@/constants";

interface ChangePasswordDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
  user,
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const { changePassword, loading } = useUsersStore();

  const mode = DIALOG_MODES.CREATE as FormDialogMode;

  const methods = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema(t)),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = methods;

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");
  const canSubmit = useMemo(
    () => !!newPassword.trim() && !!confirmPassword.trim(),
    [newPassword, confirmPassword]
  );

  const title = useMemo(() => t("admin.users.changePassword.title"), [t]);

  const description = useMemo(
    () =>
      user
        ? t("admin.users.changePassword.description", {
            name: user.fullName || "",
          } as TranslationParams<"admin.users.changePassword.description">)
        : undefined,
    [t, user]
  );

  const handleClose = useCallback(() => {
    reset();
    onOpenChange(false);
  }, [reset, onOpenChange]);

  const onSubmit = useCallback(
    async (data: ChangePasswordFormData) => {
      if (!user) return;

      try {
        await changePassword(user.id, data.newPassword);
        showSuccess(t("admin.users.changePassword.success"));
        handleClose();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      }
    },
    [user, changePassword, showSuccess, showError, t, handleClose]
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
      loading={loading}
      isSubmitting={isSubmitting}
      canSubmit={canSubmit}
      createLabel={t("admin.users.changePassword.submit")}
      cancelLabel={t("common.cancel")}
    >
      <FormProvider {...methods}>
        <Form className="mt-6 space-y-4">
          <FormField
            id="newPassword"
            label={t("admin.users.changePassword.form.newPasswordLabel")}
            type="password"
            placeholder={t(
              "admin.users.changePassword.form.newPasswordPlaceholder"
            )}
            register={register("newPassword")}
            error={errors.newPassword}
            required
            disabled={loading || isSubmitting}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
          <FormField
            id="confirmPassword"
            label={t("admin.users.changePassword.form.confirmPasswordLabel")}
            type="password"
            placeholder={t(
              "admin.users.changePassword.form.confirmPasswordPlaceholder"
            )}
            register={register("confirmPassword")}
            error={errors.confirmPassword}
            required
            disabled={loading || isSubmitting}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
        </Form>
      </FormProvider>
    </FormDialog>
  );
}
