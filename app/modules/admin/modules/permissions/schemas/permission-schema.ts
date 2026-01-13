import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";

export const permissionSchema = createZodSchema((t) =>
  z.object({
    name: createRequiredString(t, "admin.permissions.validation.nameRequired"),
    permission: createRequiredString(
      t,
      "admin.permissions.validation.permissionRequired"
    ).refine(
      (val) => {
        const parts = val.split("::");
        return (
          parts.length === 2 && parts[0].trim() !== "" && parts[1].trim() !== ""
        );
      },
      {
        message: t("admin.permissions.validation.permissionFormat"),
      }
    ),
    description: z.string().optional(),
  })
);

export type PermissionFormData = z.infer<ReturnType<typeof permissionSchema>>;
