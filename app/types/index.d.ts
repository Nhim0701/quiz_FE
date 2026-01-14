// ============================================
// API RESPONSE TYPES
// ============================================

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
  traceId: string;
  details?: unknown[] | Record<string, unknown> | null;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

/**
 * Type helper to mark that a type represents API response data (snake_case)
 * This is used for documentation purposes - runtime conversion handles the actual mapping
 *
 * Usage:
 * - Define your frontend types in camelCase
 * - API responses will be automatically converted from snake_case to camelCase
 *
 * Example:
 * ```ts
 * interface User {
 *   fullName: string;  // camelCase for frontend
 *   email: string;
 * }
 *
 * // API returns { full_name: string, email: string }
 * // Auto-converted to { fullName: string, email: string }
 * ```
 */
export type ApiResponseData<T> = T;
