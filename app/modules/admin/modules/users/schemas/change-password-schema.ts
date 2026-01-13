import { z } from "zod";
import { createZodSchema } from "@/lib";

export const changePasswordSchema = createZodSchema((t) =>
  z
    .object({
      newPassword: z
        .string()
        .min(1, t("admin.users.changePassword.validation.newPasswordRequired"))
        .min(6, t("admin.users.changePassword.validation.minLength")),
      confirmPassword: z
        .string()
        .min(
          1,
          t("admin.users.changePassword.validation.confirmPasswordRequired")
        ),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("admin.users.changePassword.validation.passwordMismatch"),
      path: ["confirmPassword"],
    })
);

export type ChangePasswordFormData = z.infer<
  ReturnType<typeof changePasswordSchema>
>;
