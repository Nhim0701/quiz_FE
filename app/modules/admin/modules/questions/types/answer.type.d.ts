// ============================================
// ANSWER TYPES
// ============================================

/**
 * Answer entity
 */
export interface AnswerProps {
  id: string;
  content: string;
  isCorrect: boolean;
  explanation: string | null;
}

export interface AnswerDialogProps {
  answer: AnswerProps | null;
  questionId: string;
  isOpen: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onEdit?: () => void;
}
