import { FileText, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { useTranslation } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboard } from "../hooks";
import {
  STATS_COLOR_CLASSES,
  STATS_VALUE_COLOR_CLASSES,
  type StatsColor,
} from "../constants";

export function Stats() {
  const { t } = useTranslation();
  const { dashboardData } = useDashboard();
  const overall = dashboardData?.overall;

  if (!overall) {
    return null;
  }
  const stats = [
    {
      label: t("dashboard.stats.totalAnswered"),
      value: overall.totalAnswered,
      icon: FileText,
      color: "blue",
    },
    {
      label: t("dashboard.stats.correctAnswers"),
      value: overall.totalCorrect,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: t("dashboard.stats.wrongAnswers"),
      value: overall.totalWrong,
      icon: XCircle,
      color: "red",
    },
    {
      label: t("dashboard.stats.accuracy"),
      value: `${overall.overallAccuracy}%`,
      icon: TrendingUp,
      color: "indigo",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const color = stat.color as StatsColor;

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
                      STATS_VALUE_COLOR_CLASSES[color]
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 ${
                    STATS_COLOR_CLASSES[color]
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
