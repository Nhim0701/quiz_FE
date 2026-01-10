// ============================================
// CONTENT MANAGEMENT TYPES (Admin only)
// ============================================

/**
 * Answer option for a question (from backend API)
 * Backend returns snake_case, axios interceptor converts to camelCase
 */
export interface Answer {
  id: string;
  content: string;
  isCorrect: boolean;
  explanation?: string | null;
}

/**
 * Question with answers (from backend API)
 * Backend returns snake_case, axios interceptor converts to camelCase
 */
export interface Question {
  id: string;
  content: string;
  imageUrl?: string | null;
  category: string;
  test: string;
  isMultipleChoice: boolean;
  createdAt: number;
  answers: Answer[];
}

/**
 * Category for questions
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
}

/**
 * Question list filter parameters
 */
export interface QuestionFilters {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
