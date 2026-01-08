import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useTestStore } from "./hooks/store";
import { TIME_CONSTANTS, ROUTES } from "@/constants";
import { useTranslation } from "@/i18n";
import { TestHeader, TestQuestion, TestSidebar, TestEmpty } from "./components";

export default function Test() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    questions,
    timeStarted,
    timeRemaining,
    loading,
    fetchAndInitializeTest,
    finishTest,
    setTimeRemaining,
    startTimer,
    setLoading,
  } = useTestStore();

  // Use ref to store the latest finishTest callback
  const finishTestRef = useRef(finishTest);
  useEffect(() => {
    finishTestRef.current = finishTest;
  }, [finishTest]);

  useEffect(() => {
    if (!testId) {
      navigate(ROUTES.TESTS.INDEX, { replace: true });
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
      const { timeRemaining: currentTime } = useTestStore.getState();
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
    return <TestEmpty onBack={() => navigate(ROUTES.TESTS.INDEX)} />;
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
