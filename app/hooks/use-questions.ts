import type { AnswerProps } from "./use-answers";

export interface QuestionProps {
  id: string;
  content: string;
  imageUrl: string | null;
  category: string;
  answers: AnswerProps[];
}
