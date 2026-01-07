import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ui/theme-toggle";
import { QuestionProps } from "../types";
import {
  ResultEmpty,
  ResultSummary,
  ResultReview,
} from "../components/pages/result";

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

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    summary,
    answers,
    questions = [],
  } = (location.state as LocationState) || {};
  if (!summary) {
    return <ResultEmpty onBack={() => navigate("/profile")} />;
  }

  // Calculate correct answers
  const correctCount =
    questions?.reduce((count, question) => {
      const userAnswerIds = answers?.[question?.id || 0] || [];
      if (userAnswerIds.length === 0) return count;

      const correctAnswerIds = question.answers
        .filter((a) => a.is_correct)
        .map((a) => a.id);
      // Check if user selected all correct answers and no incorrect ones
      const isCorrect =
        correctAnswerIds.length === userAnswerIds.length &&
        correctAnswerIds.every((id) => userAnswerIds.includes(id));
      return isCorrect ? count + 1 : count;
    }, 0) || 0;

  const wrongCount = summary.answered - correctCount;
  const accuracyPercentage =
    summary.answered > 0
      ? Math.round((correctCount / summary.answered) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 sm:py-8 px-4">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <ResultSummary
          summary={summary}
          correctCount={correctCount}
          wrongCount={wrongCount}
          accuracyPercentage={accuracyPercentage}
          onBack={() => navigate("/profile")}
          onRetake={() =>
            navigate("/test", { state: { testType: summary.testType } })
          }
        />

        {questions && answers && (
          <ResultReview questions={questions} answers={answers} />
        )}
      </div>
    </div>
  );
}
