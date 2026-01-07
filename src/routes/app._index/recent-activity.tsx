import { FileText, Check, X } from "lucide-react";
import { useProfileStore } from "@/hooks/useProfile";

export function RecentActivity() {
  const { dashboardData } = useProfileStore();
  const recentActivity = dashboardData?.recent_activity;
  if (!recentActivity || recentActivity.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
          Recent Activity
        </h2>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            No activity yet. Start a test to see your progress!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-6">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
        Recent Activity
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
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded">
                  {activity.category}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {activity.answered_at
                    ? new Date(activity.answered_at).toLocaleDateString()
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
    </div>
  );
}

