import { z } from "zod";
import type { TypedTFunction } from "@/i18n";

export const changePasswordSchema = (t: TypedTFunction) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, t("profile.validation.currentPasswordRequired")),
      newPassword: z
        .string()
        .min(1, t("profile.validation.newPasswordRequired"))
        .min(6, t("auth.validation.passwordMinLength")),
      confirmPassword: z
        .string()
        .min(1, t("auth.validation.confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("auth.validation.passwordsNotMatch"),
      path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: t("profile.validation.newPasswordMustBeDifferent"),
      path: ["newPassword"],
    });

export type ChangePasswordFormData = z.infer<
  ReturnType<typeof changePasswordSchema>
>;
