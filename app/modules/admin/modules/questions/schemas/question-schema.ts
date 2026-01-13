import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";

export const questionSchema = createZodSchema((t) =>
  z.object({
    content: createRequiredString(
      t,
      "admin.questions.validation.contentRequired"
    ),
    isMultipleChoice: z.boolean().default(false),
  })
);

export type QuestionFormData = z.infer<ReturnType<typeof questionSchema>>;
