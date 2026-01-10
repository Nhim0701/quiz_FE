import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";
import type { Question, PaginationMeta } from "@/types/content";
import { QuestionCard } from "./QuestionCard";
import { Loader2 } from "lucide-react";

interface QuestionListProps {
  searchQuery?: string;
  categoryId?: string;
}

interface QuestionListResponse {
  data: Question[];
  meta: PaginationMeta;
}

export function QuestionList({ searchQuery, categoryId }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  });

  useEffect(() => {
    loadQuestions();
  }, [searchQuery, categoryId, page]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchQuery) {
        params.append("key", "content");
        params.append("value", searchQuery);
      }

      if (categoryId) {
        params.append("key", "category");
        params.append("value", categoryId);
      }

      params.append("page", page.toString());
      params.append("page_size", "20");

      const url = `${API_ENDPOINTS.QUESTIONS.LIST}?${params.toString()}`;
      const response = await apiClient.get<QuestionListResponse>(url);

      setQuestions(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-12 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          No questions found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Previous
          </button>

          <span className="text-slate-600 dark:text-slate-400">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </span>

          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages || loading}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
