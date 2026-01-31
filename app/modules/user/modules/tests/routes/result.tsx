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
import { ROUTES } from "../constants";
import type { TestResultLocationState } from "../types";
import { pageMeta } from "@/lib";

export const meta: Route.MetaFunction = () => {
  return pageMeta(t("common.result"))();
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  const { t } = useTranslation();
  const { setResult, summary } = useResultStore();
  const getTestById = useTestsStore((state) => state.getTestById);

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
    const {
      summary: locationSummary,
      answers: locationAnswers,
      questions: locationQuestions = [],
      flags: locationFlags = {},
    } = (location.state as TestResultLocationState) || {};

    if (locationSummary && locationAnswers && locationQuestions) {
      setResult(
        locationSummary,
        locationAnswers,
        locationQuestions,
        locationFlags
      );
    }
  }, [location.state, setResult]);

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
