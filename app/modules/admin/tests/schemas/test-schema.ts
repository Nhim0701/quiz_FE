import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib/zod-schema";

export const testSchema = createZodSchema((t) =>
  z.object({
    name: createRequiredString(t, "admin.tests.validation.nameRequired"),
    categoryId: createRequiredString(
      t,
      "admin.tests.validation.categoryRequired"
    ),
  })
);

export type TestFormData = z.infer<ReturnType<typeof testSchema>>;
