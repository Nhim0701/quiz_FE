import { z } from "zod";
import { createZodSchema } from "@/lib";

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
