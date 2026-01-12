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
 * Recent activity statistics props
 */
export interface RecentActivityStatsProps {
  id: number;
  category: string;
  testName: string;
  questionPreview: string;
  isCorrect: boolean;
  answeredAt: number | null;
}

/**
 * Dashboard data props
 */
export interface DashboardProps {
  overall: OverallStatsProps;
  byCategory: ByCategoryStatsProps[];
  byTest: Record<string, ByTestStatsProps[]>;
  recentActivity: RecentActivityStatsProps[];
}
