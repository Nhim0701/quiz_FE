import { FileText, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { useTranslation } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";

export function Stats() {
  const { t } = useTranslation();
  const { dashboardData } = useMe();
  const overall = dashboardData?.overall;

  if (!overall) {
    return null;
  }
  const stats = [
    {
      label: t("dashboard.stats.totalAnswered"),
      value: overall.total_answered,
      icon: FileText,
      color: "blue",
    },
    {
      label: t("dashboard.stats.correctAnswers"),
      value: overall.total_correct,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: t("dashboard.stats.wrongAnswers"),
      value: overall.total_wrong,
      icon: XCircle,
      color: "red",
    },
    {
      label: t("dashboard.stats.accuracy"),
      value: `${overall.overall_accuracy}%`,
      icon: TrendingUp,
      color: "indigo",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colorClasses = {
          blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
          green:
            "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
          red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
          indigo:
            "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
        };
        const valueColorClasses = {
          blue: "text-slate-800 dark:text-slate-100",
          green: "text-green-600 dark:text-green-400",
          red: "text-red-600 dark:text-red-400",
          indigo: "text-indigo-600 dark:text-indigo-400",
        };

        return (
          <Card key={stat.label} className="p-4 sm:p-6">
            <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {stat.label}
                </p>
                <p
                  className={`text-2xl sm:text-3xl font-bold truncate ${
                    valueColorClasses[
                      stat.color as keyof typeof valueColorClasses
                    ]
                  }`}
                >
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 ${
                  colorClasses[stat.color as keyof typeof colorClasses]
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
