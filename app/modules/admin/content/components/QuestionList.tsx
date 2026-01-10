import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";
import type { ApiSuccessResponse } from "@/types";
import type { Question } from "@/types/content";
import { QuestionCard } from "./QuestionCard";
import { Loader2 } from "lucide-react";

interface QuestionListProps {
  searchQuery?: string;
  categoryId?: string;
}

export function QuestionList({ searchQuery, categoryId }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadQuestions();
  }, [searchQuery, categoryId, page]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (categoryId) {
        params.append("category_id", categoryId);
      }

      params.append("page", page.toString());
      params.append("page_size", "20");

      const url = `${API_ENDPOINTS.ADMIN.QUESTIONS.LIST}?${params.toString()}`;
      const response = await apiClient.get<ApiSuccessResponse<Question[]>>(url);

      setQuestions(response.data.data);

      if (response.data.meta) {
        setTotalPages(response.data.meta.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN.QUESTIONS.DELETE(questionId));
      // Reload questions after delete
      loadQuestions();
    } catch (error) {
      console.error("Failed to delete question:", error);
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
          No questions found. Try adjusting your filters or add a new question.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onDelete={handleDelete}
        />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Previous
          </button>

          <span className="text-slate-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
