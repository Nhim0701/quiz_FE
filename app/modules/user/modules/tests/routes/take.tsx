import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import type { Route } from "./+types/take";
import { useTestStore } from "../hooks";
import { ROUTES } from "../constants";
import { useTranslation, t } from "@/i18n";
import { useBreadcrumb } from "@/hooks";
import {
  useTestsStore,
  type TestProps,
} from "@/modules/admin/modules/tests/hooks";
import {
  TestHeader,
  TestQuestion,
  TestSidebar,
  TestEmpty,
  TestTakeSkeleton,
} from "../components";
import { pageMeta } from "@/lib";

export const meta: Route.MetaFunction = () => {
  return pageMeta(t("common.take"))();
};

export default function Test() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    test,
    questions,
    loading,
    fetchAndInitializeTest,
    setLoading,
    resumeTest,
    startTimer,
    pauseTest,
    isPaused,
  } = useTestStore();

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
    setLoading(true);
    fetchAndInitializeTest(testId, setLoading, (errorMessage) => {
      console.error(errorMessage);
    }).then(() => {
      if (testId) {
        const hasProgress = resumeTest(testId);
        if (!hasProgress) {
          startTimer();
        }
      }
    });
  }, [testId, navigate, fetchAndInitializeTest, setLoading, resumeTest, startTimer]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (testId && questions.length > 0 && !isPaused) {
        pauseTest(testId);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (testId && questions.length > 0 && !isPaused) {
        pauseTest(testId);
      }
    };
  }, [testId, questions.length, isPaused, pauseTest]);

  if (loading) {
    return <TestTakeSkeleton />;
  }

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
