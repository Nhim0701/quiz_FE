import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "~/modules/common/auth/hooks/useAuth";
import { useTranslation } from "@/i18n";
import useApp from "@/hooks/useApp";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "../schemas/change-password-schema";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const { changePassword } = useAuth();
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema(t)),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword(
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        setIsChangingPassword
      );
      showSuccess(t("profile.changePassword.success"));
      reset();
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("profile.changePassword.error");
      showError(errorMessage);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {t("profile.edit.changePassword")}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {t("profile.changePassword.description")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">
              {t("profile.edit.currentPassword")}
            </Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder={t("common.passwordPlaceholder")}
              {...register("currentPassword")}
              disabled={isChangingPassword}
              className={
                errors.currentPassword
                  ? "border-red-500 dark:border-red-600"
                  : ""
              }
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {t("profile.edit.newPassword")}
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder={t("common.passwordPlaceholder")}
              {...register("newPassword")}
              disabled={isChangingPassword}
              className={
                errors.newPassword
                  ? "border-red-500 dark:border-red-600"
                  : ""
              }
            />
            {errors.newPassword && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t("auth.register.confirmPasswordLabel")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t("common.passwordPlaceholder")}
              {...register("confirmPassword")}
              disabled={isChangingPassword}
              className={
                errors.confirmPassword
                  ? "border-red-500 dark:border-red-600"
                  : ""
              }
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isChangingPassword}
            >
              {t("profile.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 hover:from-purple-700 hover:to-indigo-700 dark:hover:from-purple-600 dark:hover:to-indigo-600"
            >
              {isChangingPassword && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {t("profile.edit.updatePassword")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
