import { useMe, type ByTestStatsProps } from "@/hooks/useMe";
import { useTranslation } from "@/i18n";

export function TestStats() {
  const { t } = useTranslation();
  const { dashboardData } = useMe();
  const byTest = dashboardData?.by_test;

  if (
    !byTest ||
    typeof byTest !== "object" ||
    Object.keys(byTest).length === 0
  ) {
    return null;
  }

  const testStats: ByTestStatsProps[] = Object.values(byTest).flat();

  if (testStats.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-6">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
        {t("dashboard.testStats.title")}
      </h2>
      <div className="space-y-3">
        {testStats.map((stat) => (
          <div
            key={stat.test_id}
            className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-3 last:pb-0"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {stat.test_name}
              </span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {stat.accuracy}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-green-600 dark:text-green-400">
                {stat.correct_answers} {t("dashboard.testStats.correct")}
              </span>
              <span>•</span>
              <span className="text-red-600 dark:text-red-400">
                {stat.wrong_answers} {t("dashboard.testStats.wrong")}
              </span>
              {stat.total_submitted > 0 && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {stat.total_submitted}{" "}
                    {t("dashboard.testStats.submissions")}
                  </span>
                </>
              )}
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
  );
}
