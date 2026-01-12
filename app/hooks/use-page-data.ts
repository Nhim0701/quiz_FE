import { useEffect } from "react";
import useApp from "@/hooks/use-app";
import { useTranslation, type TranslationKey } from "@/i18n";

/**
 * Common hook for page components that need to fetch data with loading and error handling
 * @param fetchFn - Async function to fetch data
 * @param errorKey - Translation key for error message (default: "errors.fetchDashboardFailed")
 * @param deps - Optional dependency array for useEffect
 */
export function usePageData(
  fetchFn: () => Promise<void>,
  errorKey: string = "errors.fetchDashboardFailed",
  deps: React.DependencyList = []
) {
  const { setLoading, showError } = useApp();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchFn();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t(errorKey as TranslationKey);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
