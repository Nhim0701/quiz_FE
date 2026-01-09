import { useMe } from "@/hooks/useMe";
import { useTranslation } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CategoryStats() {
  const { t } = useTranslation();
  const { dashboardData } = useMe();
  const byCategory = dashboardData?.by_category;

  if (!byCategory || byCategory.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.categoryStats.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {byCategory.map((stat) => (
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
                  {stat.correct_answers} {t("dashboard.categoryStats.correct")}
                </span>
                <span>•</span>
                <span className="text-red-600 dark:text-red-400">
                  {stat.wrong_answers} {t("dashboard.categoryStats.wrong")}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stat.accuracy}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
