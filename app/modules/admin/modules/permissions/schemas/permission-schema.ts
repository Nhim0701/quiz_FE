import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";
import { isValidPermissionFormat } from "@/lib/permissions";
import type { TranslationKey } from "@/i18n";

export const permissionSchema = createZodSchema((t) =>
  z.object({
    name: createRequiredString(t, "admin.permissions.validation.nameRequired"),
    permission: createRequiredString(
      t,
      "admin.permissions.validation.permissionRequired"
    ).refine(isValidPermissionFormat, {
      message: t("admin.permissions.validation.permissionFormat"),
    }),
    description: z.string().optional(),
    roleId: createRequiredString(
      t,
      "admin.permissions.validation.roleIdRequired" as TranslationKey
    ),
  })
);

export type PermissionFormData = z.infer<ReturnType<typeof permissionSchema>>;
