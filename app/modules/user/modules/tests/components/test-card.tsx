import { FileText, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "@/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TestProps } from "@/modules/admin/modules/tests/hooks";

interface TestCardProps {
  test: TestProps;
}

export function TestCard({ test }: TestCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate(`/tests/${test.id}`);
  };

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-400 dark:hover:border-blue-500 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 cursor-pointer"
      onClick={handleStartTest}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <Badge
            variant="outline"
            className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 ml-2"
          >
            {test.questionCount} {t("tests.questions")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 truncate">
            {test.name}
          </h4>
          {test.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2">
              {test.description}
            </p>
          )}
        </div>
        {test.timeLimit && (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>
              {test.timeLimit} {t("tests.timeLimit")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
