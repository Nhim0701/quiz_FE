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
import { FormField } from "@/components/common/form-field";
import { useProfile } from "../hooks";
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
  const { t, handleChangePassword } = useProfile();
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
      await handleChangePassword(data, setIsChangingPassword);
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error is already handled in handleChangePassword
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
          <FormField
            id="currentPassword"
            label={t("profile.edit.currentPassword")}
            type="password"
            placeholder={t("common.passwordPlaceholder")}
            register={register("currentPassword")}
            error={errors.currentPassword}
            disabled={isChangingPassword}
          />

          <FormField
            id="newPassword"
            label={t("profile.edit.newPassword")}
            type="password"
            placeholder={t("common.passwordPlaceholder")}
            register={register("newPassword")}
            error={errors.newPassword}
            disabled={isChangingPassword}
          />

          <FormField
            id="confirmPassword"
            label={t("auth.register.confirmPasswordLabel")}
            type="password"
            placeholder={t("common.passwordPlaceholder")}
            register={register("confirmPassword")}
            error={errors.confirmPassword}
            disabled={isChangingPassword}
          />

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
