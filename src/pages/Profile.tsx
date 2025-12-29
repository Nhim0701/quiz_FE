import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { questionApi, commonApi } from "../utils/api";
import ThemeToggle from "../components/ThemeToggle";
import useApp from "../hooks/useApp";
import { useAuth } from "../hooks/useAuth";
import { CategoryWithSetsProps, DashboardProps } from "../types";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [categoriesWithSets, setCategoriesWithSets] = useState<
    CategoryWithSetsProps[]
  >([]);
  const [dashboardData, setDashboardData] = useState<DashboardProps | null>(
    null
  );
  const { setLoading } = useApp();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesData = await questionApi.getCategoriesWithSets<
          CategoryWithSetsProps[]
        >();
        const dashboard = await commonApi.getDashboard<DashboardProps>();
        setCategoriesWithSets(categoriesData);
        setDashboardData(dashboard);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set empty arrays to avoid undefined errors
        setCategoriesWithSets([]);
        setDashboardData({
          overall: {
            total_answered: 0,
            total_correct: 0,
            total_wrong: 0,
            overall_accuracy: 0,
          },
          by_category: [],
          recent_activity: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartTest = (category: string, questionSet: string) => {
    navigate("/test", {
      state: {
        category,
        questionSet,
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
              Welcome back, {user?.name || user?.email}!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
              {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ThemeToggle className="flex-1 sm:flex-none" />
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Overall Statistics Cards */}
        {dashboardData?.overall && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Total Answered
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 truncate">
                    {dashboardData.overall.total_answered}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400"
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
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Correct Answers
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 truncate">
                    {dashboardData.overall.total_correct}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Wrong Answers
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 truncate">
                    {dashboardData.overall.total_wrong}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Accuracy
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 truncate">
                    {dashboardData.overall.overall_accuracy}%
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Tests Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">
              Available Tests
            </h2>

            {categoriesWithSets && categoriesWithSets.length > 0 ? (
              <div className="space-y-6 sm:space-y-8">
                {categoriesWithSets.map((categoryData) => (
                  <div
                    key={categoryData.category}
                    className="border-b border-slate-200 dark:border-slate-700 last:border-0 pb-6 sm:pb-8 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                          {categoryData.category}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                          {categoryData.total_questions} total questions
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {categoryData.question_sets.map((set) => (
                        <button
                          key={set.question_set}
                          onClick={() =>
                            handleStartTest(
                              categoryData.category,
                              set.question_set
                            )
                          }
                          className="bg-gradient-to-br from-slate-50 to-slate-100 hover:from-blue-50 hover:to-indigo-50 dark:from-slate-700 dark:to-slate-600 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 border-2 border-slate-200 hover:border-blue-400 dark:border-slate-600 dark:hover:border-blue-500 rounded-xl p-4 sm:p-6 text-left transition-all duration-200 hover:shadow-lg group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                              <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
                            </div>
                            <div className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full ml-2">
                              {set.question_count} questions
                            </div>
                          </div>

                          <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 truncate">
                            {set.question_set}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                            Questions {set.question_range}
                          </p>

                          <div className="mt-3 sm:mt-4 flex items-center text-blue-600 dark:text-blue-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-xs sm:text-sm font-semibold">
                            Start Test
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform"
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
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4"
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
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-2">
                  No tests available
                </p>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                  Please add questions to the database first
                </p>
              </div>
            )}
          </div>

          {/* Category Statistics */}
          {dashboardData?.by_category &&
            dashboardData.by_category.length > 0 && (
              <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                  Performance by Category
                </h2>
                <div className="space-y-3">
                  {dashboardData.by_category.map((stat) => (
                    <div
                      key={stat.category}
                      className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-3 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {stat.category}
                        </span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {stat.accuracy}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="text-green-600 dark:text-green-400">
                          {stat.correct_answers} correct
                        </span>
                        <span>•</span>
                        <span className="text-red-600 dark:text-red-400">
                          {stat.wrong_answers} wrong
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 h-2 rounded-full"
                          style={{ width: `${stat.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Recent Activity */}
          <div>
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                Recent Activity
              </h2>
              {dashboardData?.recent_activity &&
              dashboardData.recent_activity.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recent_activity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          activity.is_correct
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}
                      >
                        {activity.is_correct ? (
                          <svg
                            className="w-5 h-5 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-red-600 dark:text-red-400"
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
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded">
                            {activity.category}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {activity.answered_at
                              ? new Date(
                                  activity.answered_at
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                          {activity.question_preview}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
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
                  <p className="text-slate-500 dark:text-slate-400">
                    No activity yet. Start a test to see your progress!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
