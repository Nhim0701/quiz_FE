import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";

export const questionSchema = createZodSchema((t) =>
  z.object({
    content: createRequiredString(
      t,
      "admin.questions.validation.contentRequired"
    ),
    testId: createRequiredString(t, "admin.questions.validation.testRequired"),
    categoryId: z.string().optional(),
    isMultipleChoice: z.boolean().default(false),
  })
);

export type QuestionFormData = z.infer<ReturnType<typeof questionSchema>>;
