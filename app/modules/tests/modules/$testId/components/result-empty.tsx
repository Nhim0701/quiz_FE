import { FileText } from "lucide-react";
import { useTranslation } from "@/i18n";

interface ResultEmptyProps {
  onBack: () => void;
}

export function ResultEmpty({ onBack }: ResultEmptyProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg text-center max-w-md">
        <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          {t("info.noResultData")}
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-semibold"
        >
          {t("ui.buttons.backToDashboard")}
        </button>
      </div>
    </div>
  );
}
