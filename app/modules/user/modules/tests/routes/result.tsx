import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Route } from "./+types/result";
import { Container } from "@/components/ui/container";
import { ResultEmpty, ResultSummary, ResultReview } from "../components";
import { useResultStore } from "../hooks/use-result";
import { useTranslation, t } from "@/i18n";
import { useBreadcrumb } from "@/hooks";
import {
  useTestsStore,
  type TestProps,
} from "@/modules/admin/modules/tests/hooks";
import { ROUTES, ENDPOINTS } from "../constants";
import type {
  TestResultLocationState,
  SubmissionDetailResponse,
} from "../types";
import { questionsService } from "../services/questions.service";
import { pageMeta, apiClient } from "@/lib";
import type { ApiSuccessResponse } from "@/types";

export const meta: Route.MetaFunction = () => {
  return pageMeta(t("common.result"))();
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId, submissionId: submissionIdParam } = useParams<{
    testId: string;
    submissionId?: string;
  }>();
  const { t } = useTranslation();
  const { setResult, clearResult, summary } = useResultStore();
  const getTestById = useTestsStore((state) => state.getTestById);

  // submissionId may come from URL param or from navigation state (dashboard → result)
  const stateSubmissionId = (location.state as TestResultLocationState | undefined)?.submissionId;
  const submissionId = submissionIdParam ?? stateSubmissionId;

  // Start in loading state when a submissionId is present to avoid
  // flashing "No result data" before the fetch effect fires.
  const [loadingSubmission, setLoadingSubmission] = useState(!!submissionId);
  const [submissionLoadError, setSubmissionLoadError] = useState<string | null>(null);

  // Initialize test from cache immediately if available
  const { testsById } = useTestsStore.getState();
  const [test, setTest] = useState<TestProps | null>(
    testId ? testsById[testId] || null : null
  );

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
        {
          label: t("ui.headers.testCompleted"),
          href: ROUTES.RESULT(testId),
        },
      ];
    }

    return [baseBreadcrumb];
  }, [test, testId, t]);

  // Set breadcrumbs
  useBreadcrumb(breadcrumbs, [test?.id, test?.name, testId, t]);

  useEffect(() => {
    const state = location.state as TestResultLocationState | undefined;
    const locationSummary = state?.summary;
    const locationAnswers = state?.answers;
    const locationQuestions = state?.questions ?? [];
    const locationFlags = state?.flags ?? {};

    if (locationSummary && locationAnswers && locationQuestions?.length) {
      setResult(
        locationSummary,
        locationAnswers,
        locationQuestions,
        locationFlags
      );
      return;
    }

    if (submissionId && testId) {
      setLoadingSubmission(true);
      setSubmissionLoadError(null);
      clearResult();
      Promise.all([
        apiClient.get<ApiSuccessResponse<SubmissionDetailResponse>>(
          ENDPOINTS.SUBMISSION_GET(testId, submissionId)
        ),
        questionsService.fetchAllQuestionsWithAnswers(testId),
      ])
        .then(([subRes, questions]) => {
          const raw = subRes.data?.data ?? subRes.data;
          const data = raw as SubmissionDetailResponse | undefined;
          const submissions = data?.submissions ?? [];
          const submittedAt =
            data?.submitted_at ?? data?.submittedAt ?? 0;

          const answers: Record<string, string[]> = {};
          for (const s of submissions) {
            const qid = s.question_id ?? s.questionId ?? "";
            const aid = s.answer_id ?? s.answerId ?? "";
            if (!qid || !aid) continue;
            if (!answers[qid]) answers[qid] = [];
            answers[qid].push(aid);
          }

          if (questions.length === 0) {
            setSubmissionLoadError("No questions found for this test");
            return;
          }

          const summary = {
            total: questions.length,
            answered: Object.keys(answers).length,
            date: new Date(
              typeof submittedAt === "number"
                ? submittedAt * 1000
                : submittedAt
            ).toISOString(),
            timeSpent: 0,
            timeRemaining: 0,
          };
          setResult(summary, answers, questions, {});
        })
        .catch((err) => {
          setSubmissionLoadError(
            err?.message ?? "Failed to load submission"
          );
        })
        .finally(() => setLoadingSubmission(false));
    }
  }, [location.state, setResult, clearResult, submissionId, testId]);

  if (loadingSubmission) {
    return (
      <div className="py-6 sm:py-8 px-4 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (submissionLoadError) {
    return (
      <ResultEmpty
        onBack={() => navigate(ROUTES.INDEX)}
        message={submissionLoadError}
      />
    );
  }

  if (!summary) {
    return <ResultEmpty onBack={() => navigate(ROUTES.INDEX)} />;
  }

  return (
    <div className="py-6 sm:py-8 px-4">
      <Container maxWidth="6xl">
        <ResultSummary />

        <ResultReview />
      </Container>
    </div>
  );
}

export default Result;
