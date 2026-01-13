import type { AnswerProps } from "./answer.type";

import type { ApiResponseMeta } from "@/types";

export interface QuestionState {
  questions: QuestionProps[];
  loading: boolean;
  error: string | null;
  total: number;
  meta?: ApiResponseMeta;

  // API methods
  fetchQuestions: (
    testId: string,
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
  createQuestion: (
    testId: string,
    data: QuestionFormData
  ) => Promise<QuestionProps>;
  updateQuestion: (
    testId: string,
    questionId: string,
    data: { content: string; isMultipleChoice: boolean }
  ) => Promise<QuestionProps>;
  getQuestion: (testId: string, questionId: string) => Promise<QuestionProps>;
  deleteQuestion: (
    testId: string,
    questionId: string,
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
  refreshQuestions: (
    testId: string,
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
}

export interface QuestionProps {
  id: string;
  content: string;
  imageUrl: string | null;
  category: string;
  isMultipleChoice: boolean;
  answers: AnswerProps[];
}
