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
}

/**
 * Submission item for test submission
 */
export interface SubmissionItem {
  questionId: string;
  answerId: string;
  isCorrect: boolean;
}
