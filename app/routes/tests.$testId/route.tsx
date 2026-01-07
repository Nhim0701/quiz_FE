import { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { redirect } from "react-router";
import { tokenManager } from "@/lib/api";
import { useAuthStoreInternal } from "@/hooks/useAuth";
import useApp from "@/hooks/useApp";
import { useTestStore } from "@/hooks/useTest";
import type { SubmissionItem } from "@/types";
import { TIME_CONSTANTS, decodeTestId, getTestResultRoute } from "@/constants";
import { useTranslation } from "@/i18n";
import {
  TestHeader,
  TestQuestion,
  TestSidebar,
  TestEmpty,
} from "@/routes/tests.$testId/components";

export async function loader() {
  const user = useAuthStoreInternal.getState().user;
  if (!user && tokenManager.hasToken()) {
    try {
      await useAuthStoreInternal.getState().getCurrentUser();
      return null;
    } catch {
      throw redirect("/login");
    }
  }
  if (!user) {
    throw redirect("/login");
  }
  return null;
}

export default function Test() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { loading, setLoading, showError } = useApp();
  const { t } = useTranslation();
  const {
    questions,
    answers,
    timeStarted,
    timeRemaining,
    category: storeCategory,
    testType: storeTestType,
    fetchAndInitializeTest,
    setTimeRemaining,
    setTimeStarted,
    setSubmitting,
    submitBulk,
  } = useTestStore();

  const handleFinish = useCallback(async () => {
    // Stop timer
    setTimeStarted(false);

    const total = questions.length;
    const answered = Object.keys(answers).length;
    const initialTime = questions.length * TIME_CONSTANTS.SECONDS_PER_QUESTION;
    const timeSpent = initialTime - timeRemaining;

    // Build responses array for backend submission
    const submissions: SubmissionItem[] = [];
    for (const [questionId, selectedAnswerIds] of Object.entries(answers)) {
      const question = questions.find((q) => q.id === parseInt(questionId));
      if (!question) continue;

      for (const answerId of selectedAnswerIds) {
        const answer = question.answers.find((a) => a.id === answerId);
        if (!answer) continue;

        submissions.push({
          question_id: parseInt(questionId),
          selected_option_id: answerId,
          is_correct: answer.is_correct,
        });
      }
    }

    // Submit responses to backend
    if (submissions.length > 0) {
      setSubmitting(true);
      try {
        await submitBulk<void>(submissions);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.submitResponsesFailed");
        showError(errorMessage);
        // Continue to result page even if submission fails
      } finally {
        setSubmitting(false);
      }
    }

    const resultRoute = getTestResultRoute(
      storeCategory || storeTestType || "",
      undefined
    );
    navigate(resultRoute, {
      state: {
        answers,
        questions,
        summary: {
          total,
          answered,
          testType: storeCategory || storeTestType,
          date: new Date().toISOString(),
          timeSpent,
          timeRemaining,
        },
      },
    });
  }, [
    questions,
    answers,
    timeRemaining,
    storeCategory,
    storeTestType,
    setTimeStarted,
    setSubmitting,
    submitBulk,
    showError,
    navigate,
    t,
  ]);

  useEffect(() => {
    if (!testId) {
      navigate("/tests", { replace: true });
      return;
    }

    let category: string;
    let questionSet: string | undefined;

    try {
      const decoded = decodeTestId(testId);
      category = decoded.category;
      questionSet = decoded.questionSet;
    } catch {
      navigate("/tests", { replace: true });
      return;
    }

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        await fetchAndInitializeTest(category, questionSet);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.fetchQuestionsFailed");
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [testId, navigate, setLoading, fetchAndInitializeTest, showError, t]);

  // Timer effect
  useEffect(() => {
    if (!timeStarted || loading || questions.length === 0) return;

    const interval = setInterval(() => {
      const { timeRemaining: currentTime } = useTestStore.getState();
      if (currentTime <= 1) {
        clearInterval(interval);
        setTimeRemaining(0);
        // Auto submit when time runs out
        handleFinish();
      } else {
        setTimeRemaining(currentTime - 1);
      }
    }, TIME_CONSTANTS.TIMER_INTERVAL);

    return () => clearInterval(interval);
  }, [timeStarted, loading, questions.length, setTimeRemaining, handleFinish]);

  // Start timer when questions are loaded
  useEffect(() => {
    if (!loading && questions.length > 0 && !timeStarted) {
      setTimeStarted(true);
    }
  }, [loading, questions.length, timeStarted, setTimeStarted]);

  if (!questions.length) {
    return <TestEmpty onBack={() => navigate("/tests")} />;
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
