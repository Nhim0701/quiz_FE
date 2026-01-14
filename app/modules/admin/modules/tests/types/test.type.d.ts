// ============================================
// TEST TYPES
// ============================================

/**
 * Test entity
 */
export interface TestProps {
  id: string;
  name: string;
  questionCount: number;
  categoryId: string;
  categoryName?: string;
  description?: string;
  timeLimit: number;
  createdAt?: string | number;
  updatedAt?: string | number;
}
