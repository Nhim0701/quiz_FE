import { FileText, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { useTranslation } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboard } from "../hooks";

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
    },
    {
      label: t("dashboard.stats.correctAnswers"),
      value: overall.totalCorrect,
      icon: CheckCircle,
    },
    {
      label: t("dashboard.stats.wrongAnswers"),
      value: overall.totalWrong,
      icon: XCircle,
    },
    {
      label: t("dashboard.stats.accuracy"),
      value: `${overall.overallAccuracy}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label} className="p-4 sm:p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold truncate text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 bg-blue-50 dark:bg-blue-900/20 text-[var(--brand)]">
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
