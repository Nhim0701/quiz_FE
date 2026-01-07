import { z } from "zod";
import type { TypedTFunction } from "@/i18n";

export const registerSchema = (t: TypedTFunction) =>
  z
    .object({
      name: z.string().min(1, t("auth.validation.nameRequired")).trim(),
      email: z
        .string()
        .min(1, t("auth.validation.emailRequired"))
        .email(t("auth.validation.emailInvalid")),
      password: z
        .string()
        .min(1, t("auth.validation.passwordRequired"))
        .min(6, t("auth.validation.passwordMinLength")),
      confirmPassword: z
        .string()
        .min(1, t("auth.validation.confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwordsNotMatch"),
      path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<ReturnType<typeof registerSchema>>;
