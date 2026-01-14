import { useEffect, useCallback, useRef } from "react";
import { useApp } from "@/hooks";
import { useTranslation, type TranslationKey } from "@/i18n";

export interface UsePageDataOptions {
  /**
   * Translation key for error message
   * @default "errors.fetchDashboardFailed"
   */
  errorKey?: string;
  /**
   * Dependency array for useEffect
   * @default []
   */
  deps?: React.DependencyList;
  /**
   * Whether to skip the fetch
   * @default false
   */
  enabled?: boolean;
  /**
   * Callback when fetch succeeds
   */
  onSuccess?: (data: any) => void;
  /**
   * Callback when fetch fails
   */
  onError?: (error: Error | unknown) => void;
  /**
   * Whether to show loading state
   * @default true
   */
  showLoading?: boolean;
  /**
   * Whether to show error toast
   * @default true
   */
  showError?: boolean;
}

// Overload signatures for backward compatibility
export function usePageData(
  fetchFn: () => Promise<void>,
  errorKey?: string,
  deps?: React.DependencyList
): { refetch: () => Promise<void | undefined> };

export function usePageData<T = void>(
  fetchFn: () => Promise<T>,
  options?: UsePageDataOptions
): { refetch: () => Promise<T | undefined> };

/**
 * Common hook for page components that need to fetch data with loading and error handling
 * Can be used in all modules (user, admin, etc.)
 *
 * Supports both old API (for backward compatibility) and new options-based API
 *
 * @param fetchFn - Async function to fetch data (can return any value)
 * @param optionsOrErrorKey - Either options object or error key string (for backward compatibility)
 * @param deps - Optional dependency array (for backward compatibility)
 *
 * @example
 * // Old API (backward compatible)
 * usePageData(() => fetchData(), "errors.fetchUserFailed", []);
 *
 * @example
 * // New API with options
 * usePageData(() => fetchData(), {
 *   errorKey: "errors.fetchUserFailed",
 *   onSuccess: (data) => console.log(data),
 *   enabled: shouldFetch,
 * });
 */
export function usePageData<T = void>(
  fetchFn: () => Promise<T>,
  optionsOrErrorKey?: UsePageDataOptions | string,
  deps?: React.DependencyList
): { refetch: () => Promise<T | undefined> } {
  // Handle backward compatibility: if second param is string, treat as old API
  const isOldAPI = typeof optionsOrErrorKey === "string";
  const options: UsePageDataOptions = isOldAPI
    ? {
        errorKey: optionsOrErrorKey,
        deps: deps || [],
      }
    : optionsOrErrorKey || {};

  const {
    errorKey = "errors.fetchDashboardFailed",
    deps: dependencyArray = [],
    enabled = true,
    onSuccess,
    onError,
    showLoading = true,
    showError: showErrorToast = true,
  } = options;

  const { setLoading, showError } = useApp();
  const { t } = useTranslation();
  const fetchFnRef = useRef(fetchFn);

  // Keep fetchFn ref updated
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const executeFetch = useCallback(async (): Promise<T | undefined> => {
    if (!enabled) return undefined;

    if (showLoading) {
      setLoading(true);
    }

    try {
      const data = await fetchFnRef.current();
      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t(errorKey as TranslationKey);

      if (showErrorToast) {
        showError(errorMessage);
      }

      onError?.(error);
      throw error;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [
    enabled,
    showLoading,
    setLoading,
    showErrorToast,
    showError,
    errorKey,
    t,
    onSuccess,
    onError,
  ]);

  useEffect(() => {
    if (!enabled) return;
    executeFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...dependencyArray]);

  return {
    refetch: executeFetch,
  };
}
