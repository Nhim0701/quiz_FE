import { FileText, Check, X } from "lucide-react";
import { useTranslation } from "@/i18n";
import { formatUnixTimestamp } from "@/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "../hooks";

export function RecentActivity() {
  const { t } = useTranslation();
  const { dashboardData } = useDashboard();
  const recentActivity = dashboardData?.recentActivity;
  if (!recentActivity || recentActivity.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentActivity.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {t("dashboard.recentActivity.noActivity")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.recentActivity.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activity.isCorrect
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                {activity.isCorrect ? (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge
                    variant="outline"
                    className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                  >
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {t("dashboard.recentActivity.category")}:
                    </span>
                    {activity.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                  >
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      {t("dashboard.recentActivity.test")}:
                    </span>
                    {activity.testName}
                  </Badge>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatUnixTimestamp(activity.answeredAt) ||
                      t("dashboard.recentActivity.notAvailable")}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                  {activity.questionPreview}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
