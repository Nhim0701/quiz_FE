import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { useTranslation } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib";
import { ROUTES } from "@/modules/user/modules/tests/constants";
import { ENDPOINTS } from "../constants";
import { formatUnixTimestamp } from "@/lib";

/**
 * Raw shape from GET /api/v1/me/submission-history
 * Each item is one submission session.
 */
interface RawSubmissionEntry {
  id: string;
  submittedAt?: number;
  submissionCount?: number;
  correctCount?: number;
  wrongCount?: number;
  submissions?: Array<{
    id?: string;
    testName?: string;
    testId?: string;
    category?: string;
  }>;
}

interface FlatRow {
  submissionId: string;
  testId: string | undefined;
  testName: string;
  correctRate: number;
  submittedAt: number;
}

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
  const [rows, setRows] = useState<FlatRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(ENDPOINTS.SUBMISSION_HISTORY);
        const raw = res.data?.data ?? res.data;
        const items: RawSubmissionEntry[] = Array.isArray(raw) ? raw : [];

        const data: FlatRow[] = items
          .map((entry) => {
            const correct = entry.correctCount ?? 0;
            const total = entry.submissionCount ?? (correct + (entry.wrongCount ?? 0));
            const correctRate = total > 0 ? Math.round((correct / total) * 100) : 0;
            const firstAnswer = entry.submissions?.[0];
            const testName = firstAnswer?.testName ?? "";
            const testId = firstAnswer?.testId;
            return {
              submissionId: entry.id,
              testId,
              testName,
              correctRate,
              submittedAt: entry.submittedAt ?? 0,
            };
          })
          .filter((r) => r.testName !== "")
          .sort((a, b) => b.submittedAt - a.submittedAt);

        if (!cancelled) setRows(data);
      } catch (err) {
        console.error("[SubmissionHistory] fetch error:", err);
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRowClick = (testId: string | undefined, submissionId: string) => {
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

  if (rows.length === 0) {
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
              {rows.map((row) => {
                const timeLabel =
                  formatUnixTimestamp(row.submittedAt) ??
                  t("dashboard.submissionHistory.notAvailable");

                return (
                  <tr
                    key={row.submissionId}
                    className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {row.testName}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${scoreBadgeClass(row.correctRate)}`}
                      >
                        {row.correctRate}%
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {timeLabel}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRowClick(row.testId, row.submissionId)}
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
