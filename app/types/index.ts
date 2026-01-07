export interface User {
  name: string;
  email: string;
}

export interface UserData {
  name?: string;
  email: string;
}

export interface ThemeProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export interface DashboardProps {
  overall: {
    total_answered: number;
    total_correct: number;
    total_wrong: number;
    overall_accuracy: number;
  };
  by_category: {
    category: string;
    total_answered: number;
    correct_answers: number;
    wrong_answers: number;
    accuracy: number;
    last_attempt: string | null;
  }[];
  recent_activity: {
    id: number;
    category: string;
    question_preview: string;
    is_correct: boolean;
    answered_at: string | null;
  }[];
}

export interface CategoryWithSetsProps {
  category: string;
  total_questions: number;
  question_sets: QuestionSetProps[];
}

export interface QuestionSetProps {
  question_set: string;
  question_count: number;
  question_range: string;
}

export interface QuestionProps {
  id: number;
  content: string;
  image_url: string | null;
  category: string;
  answers: AnswerProps[];
}

export interface AnswerProps {
  id: number;
  content: string;
  is_correct: boolean;
  explanation: string | null;
}

export interface SubmissionItem {
  question_id: number;
  selected_option_id: number;
  is_correct: boolean;
}

// API Response Types
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  trace_id: string;
  details?: unknown[] | Record<string, unknown> | null;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}
