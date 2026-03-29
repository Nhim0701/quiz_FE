import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useTranslation } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib";
import { ROUTES } from "@/modules/user/modules/tests/constants";
import { ENDPOINTS } from "../constants";
import { formatUnixTimestamp } from "@/lib";
import { useDashboard } from "../hooks";

interface RawSubmissionEntry {
  id: string;
  submittedAt?: number;
  submissionCount?: number;
  correctCount?: number;
  wrongCount?: number;
  submissions?: Array<{
    testName?: string;
    category?: string;
  }>;
}

interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface FlatRow {
  submissionId: string;
  testId: string;
  testName: string;
  correctRate: number;
  submittedAt: number;
}

type SortField = "test_name" | "score" | "submitted_at";
type SortDir = "asc" | "desc";
type DateFilter = "" | "today" | "this-week" | "this-month";

function scoreBadgeClass(rate: number): string {
  if (rate >= 80) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (rate >= 60) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

function getDateRange(filter: DateFilter): { dateFrom?: number; dateTo?: number } {
  if (!filter) return {};

  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const dateTo = Math.floor(endOfDay.getTime() / 1000);

  if (filter === "today") {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    return { dateFrom: Math.floor(startOfDay.getTime() / 1000), dateTo };
  }

  if (filter === "this-week") {
    // Monday-based week: getDay()=0(Sun)→6 days back, 1(Mon)→0, …, 6(Sat)→5
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay(); // 0=Sun
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(now.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    return { dateFrom: Math.floor(startOfWeek.getTime() / 1000), dateTo };
  }

  if (filter === "this-month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return { dateFrom: Math.floor(startOfMonth.getTime() / 1000), dateTo };
  }

  return {};
}

const PAGE_SIZE = 10;

// Sort icon based on current state for a given field
function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
  return sortDir === "asc"
    ? <ArrowUp className="w-3.5 h-3.5 text-[var(--brand)]" />
    : <ArrowDown className="w-3.5 h-3.5 text-[var(--brand)]" />;
}

export const SubmissionHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dashboardData } = useDashboard();

  const [rows, setRows] = useState<FlatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("");
  const [sortField, setSortField] = useState<SortField>("submitted_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Build testName → testId lookup from already-loaded dashboard data
  const testIdByName: Record<string, string> = {};
  if (dashboardData?.byTest) {
    for (const stats of Object.values(dashboardData.byTest).flat()) {
      if (stats.testName && stats.testId) {
        testIdByName[stats.testName] = stats.testId;
      }
    }
  }

  const handleHeaderSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { dateFrom, dateTo } = getDateRange(dateFilter);

      // "score" is computed client-side; send submitted_at to backend for ordering
      const backendSortBy = sortField === "score" ? "submitted_at" : sortField;

      const params: Record<string, unknown> = {
        page,
        pageSize: PAGE_SIZE,
        sortBy: backendSortBy,
        sortOrder: sortDir,
      };
      if (search) params.search = search;
      if (dateFrom != null) params.dateFrom = dateFrom;
      if (dateTo != null) params.dateTo = dateTo;

      const res = await apiClient.get(ENDPOINTS.SUBMISSION_HISTORY, { params });
      const raw: RawSubmissionEntry[] = res.data?.data ?? res.data ?? [];
      const meta: PaginationMeta | undefined = res.data?.meta;

      let data: FlatRow[] = (Array.isArray(raw) ? raw : [])
        .map((entry) => {
          const correct = entry.correctCount ?? 0;
          const total = entry.submissionCount ?? correct + (entry.wrongCount ?? 0);
          const correctRate = total > 0 ? Math.round((correct / total) * 100) : 0;
          const testName = entry.submissions?.[0]?.testName ?? "";
          const testId = testIdByName[testName] ?? "";
          return {
            submissionId: entry.id,
            testName,
            correctRate,
            submittedAt: entry.submittedAt ?? 0,
            testId,
          };
        })
        .filter((r) => r.testName !== "" && r.testId !== "");

      // Client-side sort for test_name and score (backend handles submitted_at)
      if (sortField === "test_name") {
        data.sort((a, b) =>
          sortDir === "asc"
            ? a.testName.localeCompare(b.testName)
            : b.testName.localeCompare(a.testName)
        );
      } else if (sortField === "score") {
        data.sort((a, b) =>
          sortDir === "asc" ? a.correctRate - b.correctRate : b.correctRate - a.correctRate
        );
      }

      setRows(data);
      setTotalPages(meta?.totalPages ?? (Math.ceil((meta?.total ?? data.length) / PAGE_SIZE) || 1));
    } catch (err) {
      console.error("[SubmissionHistory] fetch error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, dateFilter, sortField, sortDir, Object.keys(testIdByName).length]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleRowClick = (testId: string, submissionId: string) => {
    navigate(ROUTES.RESULT(testId), { state: { submissionId } });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg sm:text-xl shrink-0">
            {t("dashboard.submissionHistory.title")}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onBlur={handleSearch}
                placeholder={t("dashboard.submissionHistory.searchPlaceholder")}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs w-full md:w-48 focus:ring-2 focus:ring-[var(--brand)]/20 outline-none transition-all text-slate-700 dark:text-slate-200"
              />
            </div>
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value as DateFilter); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-[var(--brand)]/20 outline-none cursor-pointer"
            >
              <option value="">{t("dashboard.submissionHistory.filterByDate")}</option>
              <option value="today">{t("dashboard.submissionHistory.today")}</option>
              <option value="this-week">{t("dashboard.submissionHistory.thisWeek")}</option>
              <option value="this-month">{t("dashboard.submissionHistory.thisMonth")}</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-slate-100 dark:bg-slate-700/50 animate-pulse" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {t("dashboard.submissionHistory.noSubmissions")}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left px-4 sm:px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort("test_name")}
                        className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                      >
                        {t("dashboard.submissionHistory.testName")}
                        <SortIcon field="test_name" sortField={sortField} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort("score")}
                        className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                      >
                        {t("dashboard.submissionHistory.score")}
                        <SortIcon field="score" sortField={sortField} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 font-medium text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort("submitted_at")}
                        className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                      >
                        {t("dashboard.submissionHistory.date")}
                        <SortIcon field="submitted_at" sortField={sortField} sortDir={sortDir} />
                      </button>
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${scoreBadgeClass(row.correctRate)}`}>
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
            {/* Pagination */}
            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 disabled:cursor-not-allowed flex items-center gap-1 hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:hover:border-slate-200 disabled:hover:text-slate-400 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  {t("dashboard.submissionHistory.previous")}
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1 hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:hover:border-slate-200 disabled:hover:text-slate-400 transition-all group"
                >
                  {t("dashboard.submissionHistory.next")}
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                {t("dashboard.submissionHistory.pageOf", { page, total: totalPages } as any)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
