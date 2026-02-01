// ============================================
// DASHBOARD TYPES
// ============================================

/**
 * Overall statistics props
 */
export interface OverallStatsProps {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  overallAccuracy: number;
}

/**
 * Statistics by category props
 */
export interface ByCategoryStatsProps {
  category: string;
  totalAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  lastAttempt: string | null;
}

/**
 * Statistics by test props
 */
export interface ByTestStatsProps {
  testId: string;
  testName: string;
  totalAnswered: number;
  totalSubmitted: number;
  correctAnswers: number;
  correctSubmissions: number;
  wrongAnswers: number;
  wrongSubmissions: number;
  accuracy: number;
  lastAttempt: string | null;
}

/**
 * Dashboard data props
 */
export interface DashboardProps {
  overall: OverallStatsProps;
  byCategory: ByCategoryStatsProps[];
  byTest: Record<string, ByTestStatsProps[]>;
}

/**
 * One submission history entry (histories[] item)
 */
export interface SubmissionHistoryEntry {
  submission_history_id?: string;
  submissionHistoryId?: string;
  submitted_at?: number;
  submittedAt?: number;
  submissions?: SubmissionAnswerRecord[];
}

/**
 * One test entry from GET /api/v1/me/submission-history (data[] item)
 */
export interface SubmissionHistoryTestItem {
  test_id?: string;
  testId?: string;
  test_name?: string;
  testName?: string;
  histories?: SubmissionHistoryEntry[];
}

/**
 * Raw answer record in submission history (snake_case from API)
 */
export interface SubmissionAnswerRecord {
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
 * Submission list item (derived by grouping answer records by submission)
 */
export interface SubmissionListItem {
  id: string;
  submittedAt?: string;
  createdAt?: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  correctRate: number;
  timeSpent?: number;
  timeFinish?: number;
}
