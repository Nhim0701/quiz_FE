import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";

export const userSchema = createZodSchema((t) =>
  z.object({
    fullName: createRequiredString(
      t,
      "admin.users.validation.fullNameRequired"
    ),
    email: z
      .string()
      .min(1, t("admin.users.validation.emailRequired"))
      .email(t("admin.users.validation.emailInvalid")),
    phone: z.string().optional(),
    birthday: z.string().optional(),
    address: z.string().optional(),
    jobTitle: z.string().optional(),
    company: z.string().optional(),
  })
);

export type UserFormData = z.infer<ReturnType<typeof userSchema>>;
