import { z } from "zod";
import { createZodSchema } from "@/lib";
import type { AnswerProps } from "../types";

export const answerFormBuilder = (answer?: AnswerProps) => ({
  content: answer?.content || "",
  isCorrect: answer?.isCorrect || false,
  explanation: answer?.explanation || "",
});

const answerSchema = createZodSchema((t) =>
  z.object({
    content: z
      .string()
      .min(1, t("admin.questions.answers.validation.contentRequired")),
    isCorrect: z.boolean().default(false),
    explanation: z.string().optional().nullable(),
  })
);

type AnswerFormData = z.infer<ReturnType<typeof answerSchema>>;

export { answerSchema, type AnswerFormData };
