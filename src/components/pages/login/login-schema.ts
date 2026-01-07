import { z } from "zod";
import type { TypedTFunction } from "@/i18n";

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
  });

export type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;
