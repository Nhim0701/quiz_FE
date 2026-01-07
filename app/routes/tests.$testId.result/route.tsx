import { useEffect } from "react";
import { useLocation, useNavigate, redirect } from "react-router-dom";
import { tokenManager } from "@/lib/api";
import { useAuthStoreInternal } from "@/hooks/useAuth";
import { Container } from "@/components/ui/container";
import type { QuestionProps } from "@/types";
import {
  ResultEmpty,
  ResultSummary,
  ResultReview,
} from "@/routes/tests.$testId.result/components";
import { useResultStore } from "@/hooks/useResult";
import { ROUTES } from "@/constants";

interface LocationState {
  summary?: {
    total: number;
    answered: number;
    testType?: string;
    date: string;
    timeSpent: number;
    timeRemaining: number;
  };
  answers?: Record<number, number[]>;
  questions?: QuestionProps[];
}

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

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setResult, summary } = useResultStore();

  useEffect(() => {
    const {
      summary: locationSummary,
      answers: locationAnswers,
      questions: locationQuestions = [],
    } = (location.state as LocationState) || {};

    if (locationSummary && locationAnswers && locationQuestions) {
      setResult(locationSummary, locationAnswers, locationQuestions);
    }
  }, [location.state, setResult]);

  if (!summary) {
    return <ResultEmpty onBack={() => navigate(ROUTES.DASHBOARD)} />;
  }

  return (
    <div className="py-6 sm:py-8 px-4">
      <Container maxWidth="4xl">
        <ResultSummary />

        <ResultReview />
      </Container>
    </div>
  );
}
