import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";

export const permissionSchema = createZodSchema((t) =>
  z.object({
    name: createRequiredString(t, "admin.permissions.validation.nameRequired"),
    description: z.string().optional(),
    resource: createRequiredString(
      t,
      "admin.permissions.validation.resourceRequired"
    ),
    action: createRequiredString(
      t,
      "admin.permissions.validation.actionRequired"
    ),
  })
);

export type PermissionFormData = z.infer<ReturnType<typeof permissionSchema>>;
