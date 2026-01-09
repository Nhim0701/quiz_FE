import { z } from "zod";
import type { TypedTFunction } from "@/i18n";

export const updateUserSchema = (t: TypedTFunction) =>
  z.object({
    userId: z.string().min(1, t("profile.validation.userIdRequired")).trim(),
    fullName: z.string().min(1, t("profile.validation.fullNameRequired")).trim(),
    phone: z.string().optional(),
    birthday: z.string().optional(),
    address: z.string().optional(),
    jobTitle: z.string().optional(),
    company: z.string().optional(),
  });

export type UpdateUserFormData = z.infer<ReturnType<typeof updateUserSchema>>;
