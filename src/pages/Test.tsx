import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { commonApi } from "../lib/api";
import ThemeToggle from "../components/ui/theme-toggle";
import useApp from "../hooks/useApp";
import { useQuestionsStore } from "../hooks/useQuestions";
import { QuestionProps, ResponseItem } from "../types";
import {
  TestHeader,
  TestQuestion,
  TestSidebar,
  TestEmpty,
} from "../components/pages/test";
interface LocationState {
  category?: string;
  questionSet?: string;
  testType?: string;
}

export default function Test() {
  const location = useLocation();
  const navigate = useNavigate();
  const { category, questionSet, testType } =
    (location.state as LocationState) || {};

  const [questions, setQuestions] = useState<QuestionProps[]>([]);
  const { loading, setLoading, showError } = useApp();
  const { getQuestionsByCategory, getQuestionsByCategoryAndSet } =
    useQuestionsStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({}); // questionId -> array of answer ids
  const [flags, setFlags] = useState<Record<number, boolean>>({}); // questionId -> true/false
  const [revealed, setRevealed] = useState<Record<number, boolean>>({}); // questionId -> true/false (tracks which questions have been revealed)
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [timeStarted, setTimeStarted] = useState(false);

  useEffect(() => {
    // Support both old (testType) and new (category + questionSet) navigation
    const categoryToUse = category || testType;

    if (!categoryToUse) {
      navigate("/profile", { replace: true });
      return;
    }

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        let data;
        if (questionSet) {
          // New way: fetch by category and set
          data = await getQuestionsByCategoryAndSet<QuestionProps[]>(
            categoryToUse,
            questionSet
          );
        } else {
          // Old way: fetch by category only (for backward compatibility)
          data = await getQuestionsByCategory<QuestionProps[]>(categoryToUse);
        }
        setQuestions(data);
        setTimeRemaining(144 * data.length); // 144s per question
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch questions. Please try again.";
        console.error("Failed to fetch questions:", error);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [
    category,
    questionSet,
    testType,
    navigate,
    setLoading,
    getQuestionsByCategory,
    getQuestionsByCategoryAndSet,
  ]);

  // Timer effect
  useEffect(() => {
    if (!timeStarted || loading || questions.length === 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto submit when time runs out
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeStarted, loading, questions.length]);

  // Start timer when questions are loaded
  useEffect(() => {
    if (!loading && questions.length > 0 && !timeStarted) {
      setTimeStarted(true);
    }
  }, [loading, questions.length, timeStarted]);

  if (!questions.length) {
    return <TestEmpty onBack={() => navigate("/profile")} />;
  }

  const currentQuestion = questions[currentIndex];
  const selectedForCurrent = answers[currentQuestion?.id || 0] || [];
  const isFlagged = !!flags[currentQuestion?.id || 0];
  const hasAnswered = selectedForCurrent.length > 0;
  const isRevealed = !!revealed[currentQuestion?.id || 0];

  // Check if current question has multiple correct answers
  const correctAnswersCount = currentQuestion?.answers.filter(
    (a) => a.is_correct
  ).length;
  const hasMultipleCorrect = (correctAnswersCount ?? 0) > 1;

  const toggleAnswer = (answerId: number) => {
    setAnswers((prev) => {
      const existing = prev[currentQuestion?.id || 0] || [];
      let next;
      if (existing.includes(answerId)) {
        // Always allow deselecting
        next = existing.filter((id) => id !== answerId);
      } else {
        if (hasMultipleCorrect) {
          // Multiple correct answers: allow selecting multiple
          next = [...existing, answerId];
        } else {
          // Single correct answer: replace previous selection
          next = [answerId];
        }
      }
      return {
        ...prev,
        [currentQuestion?.id || 0]: next,
      };
    });
  };

  const handleToggleAnswer = (answerId: number) => {
    toggleAnswer(answerId);
  };

  const handleToggleFlag = () => {
    setFlags((prev) => ({
      ...prev,
      [currentQuestion?.id || 0]: !prev[currentQuestion?.id || 0],
    }));
  };

  const handleGoNext = () => {
    if (hasAnswered) {
      setRevealed((prev) => ({
        ...prev,
        [currentQuestion?.id || 0]: true,
      }));
    }
    goNext();
  };

  const handleFinish = async () => {
    // Stop timer
    setTimeStarted(false);

    const total = questions.length;
    const answered = Object.keys(answers).length;
    const timeSpent = 30 * 60 - timeRemaining; // Calculate time spent in seconds

    // Build responses array for backend submission
    const responses: ResponseItem[] = [];
    for (const [questionId, selectedAnswerIds] of Object.entries(answers)) {
      const question = questions.find((q) => q.id === parseInt(questionId));
      if (!question) continue;

      for (const answerId of selectedAnswerIds) {
        const answer = question.answers.find((a) => a.id === answerId);
        if (!answer) continue;

        responses.push({
          question_id: parseInt(questionId),
          selected_options: [answerId],
          is_correct: answer.is_correct,
        });
      }
    }

    // Submit responses to backend
    if (responses.length > 0) {
      setSubmitting(true);
      try {
        await commonApi.submitBulk<void>(responses);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to submit responses. Please try again.";
        console.error("Failed to submit responses:", error);
        showError(errorMessage);
        // Continue to result page even if submission fails
      } finally {
        setSubmitting(false);
      }
    }

    navigate("/result", {
      state: {
        answers,
        questions,
        summary: {
          total,
          answered,
          testType: category || testType,
          date: new Date().toISOString(),
          timeSpent,
          timeRemaining,
        },
      },
    });
  };

  const goPrev = () => {
    setCurrentIndex((idx) => Math.max(0, idx - 1));
  };

  const goNext = () => {
    setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1));
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 sm:py-8 px-4">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            <TestHeader
              category={category}
              testType={testType}
              questionSet={questionSet}
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              timeRemaining={timeRemaining}
              onClose={() => navigate("/profile")}
            />

            {currentQuestion && (
              <TestQuestion
                question={currentQuestion}
                currentIndex={currentIndex}
                selectedAnswers={selectedForCurrent}
                isFlagged={isFlagged}
                isRevealed={isRevealed}
                hasMultipleCorrect={hasMultipleCorrect}
                onToggleAnswer={handleToggleAnswer}
                onToggleFlag={handleToggleFlag}
                onPrevious={goPrev}
                onNext={handleGoNext}
                canGoPrevious={currentIndex > 0}
                canGoNext={currentIndex < questions.length - 1}
              />
            )}
          </div>

          {/* Sidebar */}
          <TestSidebar
            questions={questions}
            answers={answers}
            flags={flags}
            revealed={revealed}
            currentIndex={currentIndex}
            submitting={submitting}
            onGoToQuestion={goToQuestion}
            onFinish={handleFinish}
          />
        </div>
      </div>
    </div>
  );
}
