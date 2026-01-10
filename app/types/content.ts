// ============================================
// CONTENT MANAGEMENT TYPES (Admin only)
// ============================================

/**
 * Answer option for a question
 */
export interface Answer {
  id: string;
  label: string; // A, B, C, D, E, F
  text: string;
  isCorrect: boolean;
}

/**
 * Question with answers
 */
export interface Question {
  id: string;
  questionId: string;
  categoryId: string;
  categoryName: string;
  questionText: string;
  answers: Answer[];
  correctAnswer: string; // e.g., "A", "B", etc.
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Category for questions
 */
export interface Category {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  questionCount?: number;
}

/**
 * Question list filter parameters
 */
export interface QuestionFilters {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Question form data for create/update
 */
export interface QuestionFormData {
  questionText: string;
  categoryId: string;
  answers: {
    label: string;
    text: string;
    isCorrect: boolean;
  }[];
}
