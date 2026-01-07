import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { questionApi, commonApi } from "../utils/api";
import ThemeToggle from "../components/ui/theme-toggle";
import useApp from "../hooks/useApp";
import { QuestionProps, ResponseItem } from "../types";
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
  const { loading, setLoading } = useApp();
  const { getQuestionsByCategory, getQuestionsByCategoryAndSet } = questionApi;
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
        console.error("Failed to fetch questions:", error);
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg text-center max-w-md">
          <svg
            className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            No questions found for this test type.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
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
  const hasMultipleCorrect = correctAnswersCount && correctAnswersCount > 1;

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

  const handleToggleFlag = () => {
    setFlags((prev) => ({
      ...prev,
      [currentQuestion?.id || 0]: !prev[currentQuestion?.id || 0],
    }));
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
        console.error("Failed to submit responses:", error);
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
    // Reveal the correct answer for current question before moving to next
    if (hasAnswered) {
      setRevealed((prev) => ({
        ...prev,
        [currentQuestion?.id || 0]: true,
      }));
    }
    setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1));
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isTimeLow = timeRemaining <= 5 * 60; // Less than 5 minutes

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
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="min-w-0 flex-1 pr-4">
                  <h1 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize truncate">
                    {category || testType} {questionSet && `- ${questionSet}`}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Question {currentIndex + 1} of {questions.length}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {/* Timer - Always show when questions are loaded */}
                  {!loading && questions.length > 0 && (
                    <div
                      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-mono text-xs sm:text-sm font-semibold whitespace-nowrap ${
                        isTimeLow
                          ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 animate-pulse"
                          : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{formatTime(timeRemaining)}</span>
                    </div>
                  )}
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex-shrink-0"
                    aria-label="Close"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-5 sm:p-8">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-5 sm:mb-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm sm:text-base font-bold">
                      {currentIndex + 1}
                    </span>
                    {hasMultipleCorrect && (
                      <span className="px-2 sm:px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                        Multiple Answers
                      </span>
                    )}
                    {isFlagged && (
                      <span className="px-2 sm:px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
                        </svg>
                        Flagged
                      </span>
                    )}
                  </div>
                  <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed">
                    {currentQuestion?.content}
                  </p>
                </div>
              </div>

              {/* Answer Options */}
              <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
                {[...(currentQuestion?.answers || [])]
                  .sort((a, b) => a.id - b.id)
                  .map((answer, idx) => {
                    const isSelected = selectedForCurrent.includes(answer.id);
                    const isCorrect = answer.is_correct;

                    let statusClass =
                      "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50";
                    let badgeClass =
                      "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-600";
                    let showIndicator = false;
                    let indicatorIcon = null;

                    if (isRevealed) {
                      // Show correct/incorrect styling when revealed
                      if (isCorrect) {
                        statusClass =
                          "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/30";
                        badgeClass =
                          "bg-green-600 dark:bg-green-500 text-white";
                        showIndicator = true;
                        indicatorIcon = (
                          <svg
                            className="w-5 h-5 text-green-600 dark:text-green-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        );
                      } else if (isSelected && !isCorrect) {
                        statusClass =
                          "border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/30";
                        badgeClass = "bg-red-600 dark:bg-red-500 text-white";
                        showIndicator = true;
                        indicatorIcon = (
                          <svg
                            className="w-5 h-5 text-red-600 dark:text-red-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        );
                      }
                    } else if (isSelected) {
                      // Just show selection before reveal
                      statusClass =
                        "border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30";
                      badgeClass = "bg-blue-600 dark:bg-blue-500 text-white";
                    }

                    return (
                      <button
                        key={answer.id}
                        onClick={() => !isRevealed && toggleAnswer(answer.id)}
                        disabled={isRevealed}
                        className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${statusClass} ${
                          isRevealed ? "cursor-default" : "cursor-pointer group"
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div
                            className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base font-semibold ${badgeClass}`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="flex-1 text-sm sm:text-base text-slate-700 dark:text-slate-200">
                            {answer.content}
                          </span>
                          {showIndicator && indicatorIcon}
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Explanation - Show when answer is revealed */}
              {isRevealed &&
                currentQuestion?.answers.some(
                  (a) => a.is_correct && a.explanation
                ) && (
                  <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1 text-sm sm:text-base">
                          Explanation
                        </h4>
                        <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 space-y-2 sm:space-y-3">
                          {(() => {
                            const sortedAnswers = [
                              ...(currentQuestion?.answers || []),
                            ].sort((a, b) => a.id - b.id);
                            return sortedAnswers
                              .filter((a) => a.is_correct && a.explanation)
                              .map((answer) => (
                                <div
                                  key={answer.id}
                                  className="prose prose-sm dark:prose-invert max-w-none"
                                >
                                  {sortedAnswers.filter(
                                    (a) => a.is_correct && a.explanation
                                  ).length > 1 && (
                                    <strong className="block mb-1 text-blue-900 dark:text-blue-200">
                                      Answer{" "}
                                      {String.fromCharCode(
                                        65 + sortedAnswers.indexOf(answer)
                                      )}
                                      :
                                    </strong>
                                  )}
                                  <ReactMarkdown
                                    components={{
                                      p: ({ node, ...props }) => (
                                        <p
                                          className="mb-2 leading-relaxed text-blue-800 dark:text-blue-300"
                                          {...props}
                                        />
                                      ),
                                      ul: ({ node, ...props }) => (
                                        <ul
                                          className="list-disc list-inside mb-2 space-y-1 text-blue-800 dark:text-blue-300"
                                          {...props}
                                        />
                                      ),
                                      ol: ({ node, ...props }) => (
                                        <ol
                                          className="list-decimal list-inside mb-2 space-y-1 text-blue-800 dark:text-blue-300"
                                          {...props}
                                        />
                                      ),
                                      li: ({ node, ...props }) => (
                                        <li
                                          className="leading-relaxed text-blue-800 dark:text-blue-300"
                                          {...props}
                                        />
                                      ),
                                      code: ({ node, ...props }) => (
                                        <code
                                          className="block bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 p-2 rounded text-xs font-mono overflow-x-auto"
                                          {...props}
                                        />
                                      ),
                                      strong: ({ node, ...props }) => (
                                        <strong
                                          className="font-bold text-blue-900 dark:text-blue-200"
                                          {...props}
                                        />
                                      ),
                                      em: ({ node, ...props }) => (
                                        <em
                                          className="italic text-blue-800 dark:text-blue-300"
                                          {...props}
                                        />
                                      ),
                                      a: ({ node, ...props }) => (
                                        <a
                                          className="text-blue-600 dark:text-blue-400 hover:underline"
                                          {...props}
                                        />
                                      ),
                                      h1: ({ node, ...props }) => (
                                        <h1
                                          className="text-base sm:text-lg font-bold mb-2 text-blue-900 dark:text-blue-200"
                                          {...props}
                                        />
                                      ),
                                      h2: ({ node, ...props }) => (
                                        <h2
                                          className="text-sm sm:text-base font-bold mb-2 text-blue-900 dark:text-blue-200"
                                          {...props}
                                        />
                                      ),
                                      h3: ({ node, ...props }) => (
                                        <h3
                                          className="text-xs sm:text-sm font-bold mb-1 text-blue-900 dark:text-blue-200"
                                          {...props}
                                        />
                                      ),
                                      blockquote: ({ node, ...props }) => (
                                        <blockquote
                                          className="border-l-4 border-blue-300 dark:border-blue-700 pl-3 italic my-2 text-blue-800 dark:text-blue-300"
                                          {...props}
                                        />
                                      ),
                                    }}
                                  >
                                    {answer.explanation}
                                  </ReactMarkdown>
                                </div>
                              ));
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="px-2.5 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 sm:gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>
                  <button
                    onClick={goNext}
                    disabled={currentIndex === questions.length - 1}
                    className="px-2.5 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 sm:gap-2"
                  >
                    Next
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={handleToggleFlag}
                    className={`px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-sm ${
                      isFlagged
                        ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
                        : "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill={isFlagged ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                      />
                    </svg>
                    Flag
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Summary Card */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 sm:mb-4 text-base sm:text-lg">
                Progress
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Answered
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {answeredCount} / {questions.length}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Flagged
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {Object.values(flags).filter(Boolean).length}
                  </span>
                </div>
              </div>
              <button
                onClick={handleFinish}
                disabled={submitting}
                className="w-full mt-4 sm:mt-6 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 transition-all duration-200 font-semibold text-sm sm:text-base shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  "Finish Test"
                )}
              </button>
            </div>

            {/* Question Navigator */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 sm:mb-4 text-base sm:text-lg">
                Questions
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const hasAnswer = !!answers[q.id]?.length;
                  const isCurrentQ = idx === currentIndex;
                  const isFlaggedQ = !!flags[q.id];
                  const isQuestionRevealed = !!revealed[q.id];

                  // Check if answer is correct when revealed
                  let isCorrect = false;
                  if (isQuestionRevealed && hasAnswer) {
                    const userAnswers = answers[q.id] || [];
                    const correctAnswers = q.answers
                      .filter((a) => a.is_correct)
                      .map((a) => a.id);

                    // Check if user selected all correct answers and no incorrect ones
                    isCorrect =
                      correctAnswers.length === userAnswers.length &&
                      correctAnswers.every((id) => userAnswers.includes(id));
                  }

                  let bgClass =
                    "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300";
                  if (isCurrentQ) {
                    bgClass = "bg-blue-600 dark:bg-blue-500 text-white";
                  } else if (isQuestionRevealed && hasAnswer) {
                    // Show green for correct, red for incorrect
                    bgClass = isCorrect
                      ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70"
                      : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70";
                  } else if (hasAnswer) {
                    // Just answered but not revealed yet
                    bgClass =
                      "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/70";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(idx)}
                      className={`relative aspect-square rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${bgClass}`}
                    >
                      {idx + 1}
                      {isFlaggedQ && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-400 dark:bg-yellow-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
