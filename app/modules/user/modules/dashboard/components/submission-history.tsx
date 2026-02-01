import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { useTranslation } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { apiClient } from "@/lib";
import type { ApiSuccessResponse } from "@/types";
import { ROUTES } from "@/modules/user/modules/tests/constants";
import { ENDPOINTS } from "../constants";
import type {
  SubmissionListItem,
  SubmissionAnswerRecord,
  SubmissionHistoryTestItem,
  SubmissionHistoryEntry,
} from "../types";
import { formatUnixTimestamp } from "@/lib";

interface SubmissionsWithTest {
  testId: string;
  testName: string;
  submissions: SubmissionListItem[];
}

const isCorrect = (record: SubmissionAnswerRecord): boolean => {
  const v = record.is_correct ?? record.isCorrect;
  return v === true;
}

const historyToListItem = (entry: SubmissionHistoryEntry): SubmissionListItem => {
  const records = entry.submissions ?? [];
  const correct = records.filter(isCorrect).length;
  const total = records.length;
  const incorrect = total - correct;
  const submittedAt = entry.submitted_at ?? entry.submittedAt ?? 0;
  const id =
    entry.submission_history_id ??
    entry.submissionHistoryId ??
    `sub-${submittedAt}`;
  return {
    id,
    createdAt: submittedAt,
    submittedAt: String(submittedAt),
    correctCount: correct,
    incorrectCount: incorrect,
    totalQuestions: total,
    correctRate: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
}

const formatTimeSpent = (seconds?: number): string => {
  if (seconds == null || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const SubmissionHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submissionsByTest, setSubmissionsByTest] = useState<
    SubmissionsWithTest[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<
          ApiSuccessResponse<SubmissionHistoryTestItem[]>
        >(ENDPOINTS.SUBMISSION_HISTORY);
        const raw = res.data?.data ?? res.data;
        const items = Array.isArray(raw) ? raw : [];
        const data: SubmissionsWithTest[] = items
          .map((item) => {
            const testId = item.test_id ?? item.testId ?? "";
            const testName = item.test_name ?? item.testName ?? "";
            const histories = item.histories ?? [];
            const submissions = histories
              .map(historyToListItem)
              .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
            return { testId, testName, submissions };
          })
          .filter((x) => x.submissions.length > 0);
        if (!cancelled) setSubmissionsByTest(data);
      } catch {
        if (!cancelled) setSubmissionsByTest([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCardClick = (testId: string, submissionId: string) => {
    navigate(ROUTES.RESULT_BY_SUBMISSION(testId, submissionId));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.submissionHistory.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-slate-100 dark:bg-slate-700/50 animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submissionsByTest.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.submissionHistory.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {t("dashboard.submissionHistory.noSubmissions")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="text-lg sm:text-xl">
          {t("dashboard.submissionHistory.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="single" collapsible className="w-full">
          {submissionsByTest.map(({ testId, testName, submissions }) => (
            <AccordionItem
              key={testId}
              value={testId}
              className="border-b border-slate-200 dark:border-slate-700 last:border-0"
            >
              <AccordionTrigger className="hover:no-underline py-4 sm:py-5 px-4 sm:px-6">
                <div className="flex items-center justify-between w-full text-left pr-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                      {testName}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {submissions.length}{" "}
                      {t("dashboard.submissionHistory.submissionsLabel")}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4 sm:pb-6 px-4 sm:px-6">
                <div className="space-y-3">
                  {submissions.map((sub) => {
                    const submittedAt =
                      sub.submittedAt ?? sub.createdAt ?? "";
                    const ts =
                      typeof submittedAt === "string" &&
                        /^\d+$/.test(submittedAt)
                        ? parseInt(submittedAt, 10)
                        : submittedAt;
                    const timeLabel =
                      typeof ts === "number"
                        ? formatUnixTimestamp(ts) ||
                        t("dashboard.submissionHistory.notAvailable")
                        : ts || t("dashboard.submissionHistory.notAvailable");
                    const timeSpent =
                      sub.timeSpent ?? sub.timeFinish ?? undefined;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleCardClick(testId, sub.id)}
                        className="w-full text-left p-4 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700/80 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
                      >
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                          <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            {t("dashboard.submissionHistory.totalQuestions")}:{" "}
                            {sub.totalQuestions}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                            {t("dashboard.submissionHistory.correctRate")}:{" "}
                            {sub.correctRate}%
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            {sub.correctCount}{" "}
                            {t("dashboard.submissionHistory.correct")}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                            <XCircle className="w-4 h-4 flex-shrink-0" />
                            {sub.incorrectCount}{" "}
                            {t("dashboard.submissionHistory.incorrect")}
                          </span>
                          {timeSpent != null && (
                            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              {t("dashboard.submissionHistory.timeFinish")}:{" "}
                              {formatTimeSpent(timeSpent)}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            {t("dashboard.submissionHistory.timeSubmit")}:{" "}
                            {timeLabel}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                          {t("dashboard.submissionHistory.viewResult")} →
                        </p>
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
