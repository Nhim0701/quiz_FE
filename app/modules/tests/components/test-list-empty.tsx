import { FileText } from "lucide-react";
import { useTranslation } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TestListEmpty() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tests.availableTests")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 sm:py-12">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-2">
            {t("tests.noTestsAvailable")}
          </p>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
            {t("tests.addQuestionsFirst")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
