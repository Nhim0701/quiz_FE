import { z } from "zod";
import {
  createZodSchema,
  createRequiredString,
  createOptionalString,
  createNumberField,
} from "@/lib";

export const testSchema = createZodSchema((t) =>
  z.object({
    name: createRequiredString(t, "admin.tests.validation.nameRequired"),
    categoryId: createRequiredString(
      t,
      "admin.tests.validation.categoryRequired"
    ),
    description: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    timeLimit: z
      .number({
        required_error: t("admin.tests.validation.timeLimitRequired"),
        invalid_type_error: t("admin.tests.validation.timeLimitRequired"),
      })
      .min(1, t("admin.tests.validation.timeLimitMin")),
  })
);

export type TestFormData = z.infer<ReturnType<typeof testSchema>>;
