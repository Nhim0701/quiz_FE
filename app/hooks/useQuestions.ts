import type { AnswerProps } from "./useAnswers";

export interface QuestionProps {
  id: string;
  content: string;
  imageUrl: string | null;
  category: string;
  answers: AnswerProps[];
}
