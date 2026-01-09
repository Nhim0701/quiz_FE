export interface SubmissionItem {
  question_id: string;
  answer_id: string;
  is_correct: boolean;
}

// API Response Types
export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiResponseMeta extends PaginationMeta {
  [key: string]: unknown;
}
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  meta?: ApiResponseMeta;
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
