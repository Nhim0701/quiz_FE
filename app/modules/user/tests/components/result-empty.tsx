import { FileText } from "lucide-react";
import { useTranslation } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResultEmptyProps {
  onBack: () => void;
}

export function ResultEmpty({ onBack }: ResultEmptyProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="p-8 shadow-lg text-center max-w-md">
        <CardContent className="p-0">
          <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            {t("info.noResultData")}
          </p>
          <Button
            onClick={onBack}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600"
          >
            {t("ui.buttons.backToDashboard")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
