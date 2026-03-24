import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { useTranslation } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface FlatSubmissionRow {
  testId: string;
  testName: string;
  submission: SubmissionListItem;
}

const isCorrect = (record: SubmissionAnswerRecord): boolean => {
  const v = record.is_correct ?? record.isCorrect;
  return v === true;
};

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
};

function scoreBadgeClass(rate: number): string {
  if (rate >= 80) {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  }
  if (rate >= 60) {
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  }
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
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

  const flatRows: FlatSubmissionRow[] = submissionsByTest.flatMap(
    ({ testId, testName, submissions }) =>
      submissions.map((submission) => ({ testId, testName, submission }))
  );

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

  if (flatRows.length === 0) {
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-4 sm:px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                  {t("dashboard.submissionHistory.testName")}
                </th>
                <th className="text-left px-4 sm:px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                  {t("dashboard.submissionHistory.score")}
                </th>
                <th className="text-left px-4 sm:px-6 py-3 font-medium text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                  {t("dashboard.submissionHistory.date")}
                </th>
                <th className="text-right px-4 sm:px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                  {t("dashboard.submissionHistory.action")}
                </th>
              </tr>
            </thead>
            <tbody>
              {flatRows.map(({ testId, testName, submission: sub }) => {
                const submittedAt = sub.submittedAt ?? sub.createdAt ?? "";
                const ts =
                  typeof submittedAt === "string" && /^\d+$/.test(submittedAt)
                    ? parseInt(submittedAt, 10)
                    : submittedAt;
                const timeLabel =
                  typeof ts === "number"
                    ? formatUnixTimestamp(ts) ||
                      t("dashboard.submissionHistory.notAvailable")
                    : ts || t("dashboard.submissionHistory.notAvailable");

                return (
                  <tr
                    key={sub.id}
                    className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {testName}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${scoreBadgeClass(sub.correctRate)}`}
                      >
                        {sub.correctRate}%
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {timeLabel}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleCardClick(testId, sub.id)}
                        className="text-xs font-medium text-[var(--brand)] hover:underline"
                      >
                        {t("dashboard.submissionHistory.viewResult")} →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
