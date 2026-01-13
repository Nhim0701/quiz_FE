import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";

export const roleSchema = createZodSchema((t) =>
  z.object({
    name: createRequiredString(t, "admin.roles.validation.nameRequired"),
    description: z.string().optional(),
  })
);

export type RoleFormData = z.infer<ReturnType<typeof roleSchema>>;
