import { z } from "zod";
import type { TypedTFunction } from "@/i18n";
import type { User } from "@/modules/admin/modules/users/hooks";

export const initialUpdateUserFormData = (
  user: User | null
): UpdateUserFormData => ({
  userId: user?.userId || "",
  fullName: user?.fullName || "",
  phone: user?.phone || "",
  birthday: user?.birthday || "",
  address: user?.address || "",
  jobTitle: user?.jobTitle || "",
  company: user?.company || "",
});

export const updateUserSchema = (t: TypedTFunction) =>
  z.object({
    userId: z.string().min(1, t("profile.validation.userIdRequired")).trim(),
    fullName: z
      .string()
      .min(1, t("profile.validation.fullNameRequired"))
      .trim(),
    phone: z.string().optional(),
    birthday: z.string().optional(),
    address: z.string().optional(),
    jobTitle: z.string().optional(),
    company: z.string().optional(),
  });

export type UpdateUserFormData = z.infer<ReturnType<typeof updateUserSchema>>;
