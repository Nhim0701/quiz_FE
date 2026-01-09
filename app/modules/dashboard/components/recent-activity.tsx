import { FileText, Check, X } from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { useTranslation } from "@/i18n";
import { formatUnixTimestamp } from "@/lib/utils";

export function RecentActivity() {
  const { t } = useTranslation();
  const { dashboardData } = useMe();
  const recentActivity = dashboardData?.recent_activity;
  if (!recentActivity || recentActivity.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
          {t("dashboard.recentActivity.title")}
        </h2>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            {t("dashboard.recentActivity.noActivity")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-6">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
        {t("dashboard.recentActivity.title")}
      </h2>
      <div className="space-y-3">
        {recentActivity.map((activity) => (
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
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    {t("dashboard.recentActivity.category")}:
                  </span>
                  {activity.category}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">
                    {t("dashboard.recentActivity.test")}:
                  </span>
                  {activity.test_name}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {formatUnixTimestamp(activity.answered_at) ||
                    t("dashboard.recentActivity.notAvailable")}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                {activity.question_preview}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
