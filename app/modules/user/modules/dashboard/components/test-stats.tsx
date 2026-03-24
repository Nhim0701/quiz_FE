import { useTranslation } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "../hooks";
import type { ByTestStatsProps } from "../types";

function scoreBadgeClass(accuracy: number): string {
  if (accuracy >= 80) {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  }
  if (accuracy >= 60) {
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  }
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

export function TestStats() {
  const { t } = useTranslation();
  const { dashboardData } = useDashboard();
  const byTest = dashboardData?.byTest;

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
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.testStats.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {testStats.map((stat) => (
            <div
              key={stat.testId}
              className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-3 last:pb-0"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {stat.testName}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreBadgeClass(stat.accuracy)}`}
                >
                  {stat.accuracy}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-green-600 dark:text-green-400">
                  {stat.correctAnswers} {t("dashboard.testStats.correct")}
                </span>
                <span>•</span>
                <span className="text-red-600 dark:text-red-400">
                  {stat.wrongAnswers} {t("dashboard.testStats.wrong")}
                </span>
                {stat.totalSubmitted > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {stat.totalSubmitted}{" "}
                      {t("dashboard.testStats.submissions")}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
