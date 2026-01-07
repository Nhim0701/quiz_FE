import { useEffect } from "react";
import { useLocation, useNavigate, redirect } from "react-router-dom";
import { tokenManager } from "@/lib/api";
import { useAuthStoreInternal } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ui/theme-toggle";
import { QuestionProps } from "@/types";
import {
  ResultEmpty,
  ResultSummary,
  ResultReview,
} from "./";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 sm:py-8 px-4">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <ResultSummary />

        <ResultReview />
      </div>
    </div>
  );
}

