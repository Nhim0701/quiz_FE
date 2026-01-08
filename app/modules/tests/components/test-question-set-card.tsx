import { FileText } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "@/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { QuestionSetProps } from "@/hooks/useQuestionSets";

interface TestQuestionSetCardProps {
  set: QuestionSetProps;
}

export function TestQuestionSetCard({ set }: TestQuestionSetCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate(`/tests/${set.id}`);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-400 dark:hover:border-blue-500 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full ml-2">
            {set.question_count} {t("tests.questions")}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3" onClick={handleStartTest}>
        <div>
          <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 truncate">
            {set.name}
          </h4>
        </div>
      </CardContent>
    </Card>
  );
}
