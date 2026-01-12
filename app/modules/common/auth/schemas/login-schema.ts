import { z } from "zod";
import type { TypedTFunction } from "@/i18n";

/**
 * Login form validation schema
 * Uses Zod for runtime validation
 */
export const loginSchema = (t: TypedTFunction) =>
  z.object({
    email: z
      .string()
      .min(1, t("auth.validation.emailRequired"))
      .email(t("auth.validation.emailInvalid")),
    password: z
      .string()
      .min(1, t("auth.validation.passwordRequired"))
      .min(6, t("auth.validation.passwordMinLength")),
    rememberMe: z.boolean().optional().default(false),
  });

/**
 * Login form data type - inferred from schema
 * This matches the LoginFormData type in @/types/auth
 */
export type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;
