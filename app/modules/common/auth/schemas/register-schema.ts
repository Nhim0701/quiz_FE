import { z } from "zod";
import type { TypedTFunction } from "@/i18n";

/**
 * Register form validation schema
 * Uses Zod for runtime validation
 */
export const registerSchema = (t: TypedTFunction) =>
  z
    .object({
      email: z
        .string()
        .min(1, t("auth.validation.emailRequired"))
        .email(t("auth.validation.emailInvalid")),
      fullName: z.string().min(1, t("auth.validation.nameRequired")).trim(),
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

/**
 * Register form data type - inferred from schema
 * This matches the RegisterFormData type in @/types/auth
 */
export type RegisterFormData = z.infer<ReturnType<typeof registerSchema>>;
