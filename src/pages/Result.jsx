import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import ThemeToggle from '../components/ThemeToggle';

export default function Result({ onAddResult, theme, onToggleTheme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { summary, answers, questions } = location.state || {};
  const [visibleExplanations, setVisibleExplanations] = useState({}); // questionId -> true/false

  const toggleExplanation = (questionId) => {
    setVisibleExplanations((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  useEffect(() => {
    if (!summary) return;

    onAddResult?.({
      date: new Date(summary.date).toLocaleString(),
      testName: summary.testType?.toUpperCase(),
      total: summary.total,
      answered: summary.answered,
    });
  }, [summary, onAddResult]);

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg text-center max-w-md">
          <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mb-6 text-slate-600 dark:text-slate-400">No result data. Please start a test from your profile.</p>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const completionPercentage = Math.round((summary.answered / summary.total) * 100);

  // Calculate correct answers
  const correctCount = questions?.reduce((count, question) => {
    const userAnswerIds = answers?.[question.id] || [];
    if (userAnswerIds.length === 0) return count;

    const correctAnswerIds = question.answers.filter(a => a.is_correct).map(a => a.id);
    // Check if user selected all correct answers and no incorrect ones
    const isCorrect = correctAnswerIds.length === userAnswerIds.length &&
                      correctAnswerIds.every(id => userAnswerIds.includes(id));
    return isCorrect ? count + 1 : count;
  }, 0) || 0;

  const wrongCount = summary.answered - correctCount;
  const accuracyPercentage = summary.answered > 0 ? Math.round((correctCount / summary.answered) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 sm:py-8 px-4">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Summary Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Test Completed!</h1>
            <p className="text-slate-600 dark:text-slate-400 capitalize">{summary.testType} Quiz</p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-300 mb-2">{summary.total}</div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total Questions</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-300 mb-2">{correctCount}</div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Correct</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-300 mb-2">{wrongCount}</div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Wrong</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-300 mb-2">{accuracyPercentage}%</div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Accuracy</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span>Progress</span>
              <span>{summary.answered} / {summary.total}</span>
            </div>
            <div className="relative w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="px-5 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/test', { state: { testType: summary.testType } })}
              className="px-5 sm:px-8 py-2.5 sm:py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 font-semibold text-sm sm:text-base"
            >
              Take Another Test
            </button>
          </div>
        </div>

        {/* Review Answers */}
        {questions && answers && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Your Answers</h2>
            <div className="space-y-4 sm:space-y-6">
              {questions.map((question, idx) => {
                const userAnswerIds = answers[question.id] || [];
                const userAnswers = question.answers.filter(a => userAnswerIds.includes(a.id));

                return (
                  <div key={question.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0 pb-4 sm:pb-6 last:pb-0">
                    {/* Question */}
                    <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center text-sm sm:text-base">
                        {idx + 1}
                      </span>
                      <p className="flex-1 text-slate-800 dark:text-slate-100 text-sm sm:text-base">{question.content}</p>
                    </div>

                    {/* All Options */}
                    <div className="ml-9 sm:ml-11 space-y-2 mb-3">
                      {[...question.answers].sort((a, b) => a.id - b.id).map((answer, ansIdx) => {
                        const isSelected = userAnswerIds.includes(answer.id);
                        return (
                          <div
                            key={answer.id}
                            className={`p-2.5 sm:p-3 rounded-lg border-2 ${
                              isSelected
                                ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30'
                            }`}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs sm:text-sm font-medium ${
                                isSelected
                                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                  : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                              }`}>
                                {String.fromCharCode(65 + ansIdx)}
                              </span>
                              <span className="text-slate-700 dark:text-slate-200 text-sm sm:text-base">{answer.content}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Show explanation toggle if available */}
                    {question.answers.some(a => a.explanation) && (
                      <div className="ml-9 sm:ml-11">
                        <button
                          onClick={() => toggleExplanation(question.id)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${visibleExplanations[question.id] ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {visibleExplanations[question.id] ? 'Hide Explanation' : 'Show Explanation'}
                        </button>

                        {visibleExplanations[question.id] && (
                          <div className="mt-2 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <div className="flex-1">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1 text-sm sm:text-base">Explanation</h4>
                                <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 space-y-2 sm:space-y-3">
                                  {(() => {
                                    const sortedAnswers = [...question.answers].sort((a, b) => a.id - b.id);
                                    return sortedAnswers
                                      .filter(a => a.is_correct && a.explanation)
                                      .map((answer) => (
                                        <div key={answer.id} className="prose prose-sm dark:prose-invert max-w-none">
                                          {sortedAnswers.filter(a => a.is_correct && a.explanation).length > 1 && (
                                            <strong className="block mb-1 text-blue-900 dark:text-blue-200">
                                              Answer {String.fromCharCode(65 + sortedAnswers.indexOf(answer))}:
                                            </strong>
                                          )}
                                        <ReactMarkdown
                                          components={{
                                            p: ({node, ...props}) => <p className="mb-2 leading-relaxed text-blue-800 dark:text-blue-300" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1 text-blue-800 dark:text-blue-300" {...props} />,
                                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1 text-blue-800 dark:text-blue-300" {...props} />,
                                            li: ({node, ...props}) => <li className="leading-relaxed text-blue-800 dark:text-blue-300" {...props} />,
                                            code: ({node, inline, ...props}) =>
                                              inline
                                                ? <code className="bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                                                : <code className="block bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 p-2 rounded text-xs font-mono overflow-x-auto" {...props} />,
                                            strong: ({node, ...props}) => <strong className="font-bold text-blue-900 dark:text-blue-200" {...props} />,
                                            em: ({node, ...props}) => <em className="italic text-blue-800 dark:text-blue-300" {...props} />,
                                            a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
                                            h1: ({node, ...props}) => <h1 className="text-base sm:text-lg font-bold mb-2 text-blue-900 dark:text-blue-200" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="text-sm sm:text-base font-bold mb-2 text-blue-900 dark:text-blue-200" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="text-xs sm:text-sm font-bold mb-1 text-blue-900 dark:text-blue-200" {...props} />,
                                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-300 dark:border-blue-700 pl-3 italic my-2 text-blue-800 dark:text-blue-300" {...props} />,
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
                      </div>
                    )}

                    {/* Unanswered */}
                    {userAnswers.length === 0 && (
                      <div className="ml-9 sm:ml-11 p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">Not answered</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
