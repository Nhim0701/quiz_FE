import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";
import type { Category } from "../hooks";

export const categoryFormBuilder = (category?: Category) => ({
  name: category?.name || "",
});

export const categorySchema = createZodSchema((t) =>
  z.object({
    name: createRequiredString(t, "admin.categories.validation.nameRequired"),
  })
);

export type CategoryFormData = z.infer<ReturnType<typeof categorySchema>>;
