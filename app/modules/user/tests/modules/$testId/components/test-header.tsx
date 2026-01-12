import { useEffect, useState } from "react";
import { Clock, X } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useTestStore } from "~/modules/user/tests/modules/$testId/hooks/store";
import {
  useTestsStore,
  type TestProps,
} from "@/hooks/useTests";
import { useNavigate, useParams } from "react-router";
import { ROUTES } from "@/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TestHeader() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  const { currentIndex, questions, timeRemaining } = useTestStore();
  const getTestById = useTestsStore(
    (state) => state.getTestById
  );

  const [test, setTest] = useState<TestProps | null>(null);

  useEffect(() => {
    if (testId) {
      getTestById(testId).then((testData) => {
        setTest(testData);
      });
    } else {
      setTest(null);
    }
  }, [testId, getTestById]);

  const handleClose = () => {
    navigate(ROUTES.TESTS.INDEX);
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isTimeLow = timeRemaining <= 5 * 60;

  const progressValue = questions.length > 0
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;

  return (
    <Card className="p-4 sm:p-6">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 flex-1 pr-4">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize truncate">
              {test?.name || ""}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("test.question", {
                current: currentIndex + 1,
                total: questions.length,
              } as any)}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Badge
              variant="outline"
              className={`font-mono text-xs sm:text-sm font-semibold whitespace-nowrap ${
                isTimeLow
                  ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 animate-pulse"
                  : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mr-1.5" />
              <span>{formatTime(timeRemaining)}</span>
            </Badge>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              aria-label={t("common.close")}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 transition-all duration-300"
            style={{ width: `${progressValue}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
}
