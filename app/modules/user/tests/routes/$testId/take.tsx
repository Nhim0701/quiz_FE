import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useTestStore, useTestStoreState } from "../../hooks";
import { TIME_CONSTANTS, ROUTES } from "../../constants";
import { useTranslation } from "@/i18n";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useTestsStore, type TestProps } from "@/modules/admin/tests/hooks";
import {
  TestHeader,
  TestQuestion,
  TestSidebar,
  TestEmpty,
} from "../../components";

export default function Test() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    questions,
    timeStarted,
    loading,
    fetchAndInitializeTest,
    finishTest,
    setTimeRemaining,
    startTimer,
    setLoading,
  } = useTestStore();
  const getTestById = useTestsStore((state) => state.getTestById);

  // Initialize test from cache immediately if available
  const { testsById } = useTestsStore.getState();
  const [test, setTest] = useState<TestProps | null>(
    testId ? testsById[testId] || null : null
  );

  // Use ref to store the latest finishTest callback
  const finishTestRef = useRef(finishTest);
  useEffect(() => {
    finishTestRef.current = finishTest;
  }, [finishTest]);

  // Fetch test data for breadcrumb - fetch if not in cache
  useEffect(() => {
    if (!testId) {
      setTest(null);
      return;
    }

    // If already have test data, don't fetch again
    if (test && test.id === testId) {
      return;
    }

    // Check cache again (in case it was updated)
    const currentCache = useTestsStore.getState().testsById;
    if (currentCache[testId]) {
      setTest(currentCache[testId]);
      return;
    }

    // Fetch from API if not in cache
    getTestById(testId)
      .then((testData) => {
        if (testData) {
          setTest(testData);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch test for breadcrumb:", error);
      });
  }, [testId, getTestById, test]);

  // Memoize breadcrumbs to prevent unnecessary re-renders
  const breadcrumbs = useMemo(() => {
    const baseBreadcrumb = {
      label: t("sidebar.tests"),
      href: ROUTES.INDEX,
    };

    if (test && testId && test.name) {
      return [
        baseBreadcrumb,
        {
          label: test.name,
          href: ROUTES.TAKE(testId),
        },
      ];
    }

    return [baseBreadcrumb];
  }, [test, testId, t]);

  // Set breadcrumbs
  useBreadcrumb(breadcrumbs, [test?.id, test?.name, testId, t]);

  useEffect(() => {
    if (!testId) {
      navigate(ROUTES.INDEX, { replace: true });
      return;
    }

    fetchAndInitializeTest(testId, setLoading, (errorMessage) => {
      console.error(errorMessage);
    });
  }, [testId, navigate, fetchAndInitializeTest, setLoading]);

  // Timer effect
  useEffect(() => {
    if (!timeStarted || loading || questions.length === 0) return;

    const interval = setInterval(() => {
      const { timeRemaining: currentTime } = useTestStoreState.getState();
      if (currentTime <= 1) {
        clearInterval(interval);
        setTimeRemaining(0);
        // Auto submit when time runs out - use ref to avoid dependency issues
        finishTestRef.current(navigate, testId || "", (errorMessage) => {
          console.error(errorMessage);
        });
      } else {
        setTimeRemaining(currentTime - 1);
      }
    }, TIME_CONSTANTS.TIMER_INTERVAL);

    return () => clearInterval(interval);
  }, [
    timeStarted,
    loading,
    questions.length,
    setTimeRemaining,
    navigate,
    testId,
  ]);

  // Start timer when questions are loaded
  useEffect(() => {
    startTimer();
  }, [loading, questions.length, startTimer]);

  if (!questions.length) {
    return <TestEmpty onBack={() => navigate(ROUTES.INDEX)} />;
  }

  return (
    <div className="py-6 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            <TestHeader />

            <TestQuestion />
          </div>

          {/* Sidebar */}
          <TestSidebar />
        </div>
      </div>
    </div>
  );
}
