import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";
import type { QuestionProps } from "../types";

export const questionFormBuilder = (
  testId?: string,
  question?: QuestionProps
) => ({
  content: question?.content || "",
  testId: testId || "",
  categoryId: question?.category || "",
  isMultipleChoice: question?.isMultipleChoice || false,
});

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
