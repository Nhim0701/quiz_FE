import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, type TranslationParams } from "@/i18n";
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
import { useApp } from "@/hooks";
import { useUsersStore, type User } from "../hooks";
import { changePasswordSchema, type ChangePasswordFormData } from "../schemas";
import { Loader2, X } from "lucide-react";

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema(t)),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
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
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("admin.users.changePassword.title")}</DialogTitle>
          <DialogDescription>
            {t("admin.users.changePassword.description", {
              name: user?.fullName || "",
            } as TranslationParams<"admin.users.changePassword.description">)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
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
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={loading || isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
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
              {t("admin.users.changePassword.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
