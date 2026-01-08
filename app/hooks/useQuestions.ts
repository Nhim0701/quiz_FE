import type { AnswerProps } from "./useAnswers";

export interface QuestionProps {
  id: string;
  content: string;
  image_url: string | null;
  category: string;
  answers: AnswerProps[];
}
