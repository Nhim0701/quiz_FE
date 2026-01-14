import type { ApiResponseMeta } from "@/types";
import type { AnswerProps } from "./answer.type";

// ============================================
// QUESTION TYPES
// ============================================

/**
 * Question entity
 */
export interface QuestionProps {
  id: string;
  content: string;
  imageUrl: string | null;
  category: string;
  test: string;
  isMultipleChoice: boolean;
  answers: AnswerProps[];
}

export interface QuestionState {
  questions: QuestionProps[];
  loading: boolean;
  error: string | null;
  total: number;
  meta?: ApiResponseMeta;

  // Dialog state
  isDialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;

  // API methods
  fetchQuestions: (
    page?: number,
    pageSize?: number,
    filters?: Record<string, string>
  ) => Promise<void>;
  createQuestion: (data: {
    testId: string;
    content: string;
    isMultipleChoice: boolean;
    categoryId?: string;
  }) => Promise<QuestionProps>;
  updateQuestion: (
    testId: string,
    questionId: string,
    data: {
      content: string;
      isMultipleChoice: boolean;
      testId?: string;
      categoryId?: string;
    }
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
