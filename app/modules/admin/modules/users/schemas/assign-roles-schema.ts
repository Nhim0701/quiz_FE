import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";

export const assignRolesSchema = createZodSchema((t) =>
  z.object({
    roleId: createRequiredString(
      t,
      "admin.users.assignRoles.validation.roleIdRequired"
    ),
  })
);

export type AssignRolesFormData = z.infer<ReturnType<typeof assignRolesSchema>>;
