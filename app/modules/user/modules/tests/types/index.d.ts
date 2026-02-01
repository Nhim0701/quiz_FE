// ============================================
// TESTS TYPES
// ============================================

import type { QuestionProps } from "@/modules/admin/modules/questions/types";

/**
 * Location state for test result page
 */
export interface TestResultLocationState {
  summary?: {
    total: number;
    answered: number;
    testType?: string;
    date: string;
    timeSpent: number;
    timeRemaining: number;
  };
  answers?: Record<string, string[]>;
  questions?: QuestionProps[];
  flags?: Record<string, boolean>;
}

/**
 * Submission item for test submission
 */
export interface SubmissionItem {
  questionId: string;
  answerId: string;
  isCorrect: boolean;
}

/**
 * Submission result from GET /api/v1/tests/:testId/submit/:submissionId (legacy shape)
 */
export interface SubmissionResultResponse {
  summary: TestResultLocationState["summary"];
  answers: Record<string, string[]>;
  questions: QuestionProps[];
  flags?: Record<string, boolean>;
}

/**
 * Answer record in submission detail (snake_case from API)
 */
export interface SubmissionDetailAnswerRecord {
  id: string;
  answer_id?: string;
  answerId?: string;
  question_id?: string;
  questionId?: string;
  user_id?: string;
  userId?: string;
  is_correct?: boolean;
  isCorrect?: boolean;
  answered_at?: number;
  answeredAt?: number;
  created_at?: number;
  createdAt?: number;
}

/**
 * Response from GET /api/v1/tests/:testId/submit/:submission_history_id
 */
export interface SubmissionDetailResponse {
  id?: string;
  user_id?: string;
  userId?: string;
  submitted_at?: number;
  submittedAt?: number;
  submission_count?: number;
  submissionCount?: number;
  created_at?: number;
  createdAt?: number;
  updated_at?: number;
  updatedAt?: number;
  submissions?: SubmissionDetailAnswerRecord[];
}
