// ============================================
// TESTS TYPES
// ============================================

import type { QuestionProps } from "@/hooks";

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
