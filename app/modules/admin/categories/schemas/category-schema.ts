import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib/zod-schema";

// Using the utility function
export const categorySchema = createZodSchema((t) =>
  z.object({
    name: createRequiredString(t, "admin.categories.validation.nameRequired"),
  })
);

export type CategoryFormData = z.infer<ReturnType<typeof categorySchema>>;
