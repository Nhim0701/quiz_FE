import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";
import type { Role } from "../hooks";

export const roleFormBuilder = (role?: Role) => ({
  name: role?.name || "",
  description: role?.description || "",
});

export const roleSchema = createZodSchema((t) =>
  z.object({
    name: createRequiredString(t, "admin.roles.validation.nameRequired"),
    description: z.string().optional(),
  })
);

export type RoleFormData = z.infer<ReturnType<typeof roleSchema>>;
