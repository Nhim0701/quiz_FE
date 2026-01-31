import type { ApiSuccessResponse, PaginationMeta } from "@/types";
import type { QuestionProps, AnswerProps } from "@/modules/admin/modules/questions/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";
import { ENDPOINTS as QUESTION_ENDPOINTS } from "@/modules/admin/modules/questions/constants";

const PAGE_SIZE = 100;
const CONCURRENCY_LIMIT = 5;

// Helper for concurrency control
async function pLimit<T>(
  items: T[],
  fn: (item: T) => Promise<any>,
  limit: number
): Promise<any[]> {
  const results: any[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);

    const e: Promise<void> = p.then(() => {
      executing.splice(executing.indexOf(e), 1);
    });
    executing.push(e);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

export const questionsService = {
  fetchQuestionsPage: async (
    testId: string,
    page: number
  ): Promise<ApiSuccessResponse<QuestionProps[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<QuestionProps[]>>(
      ENDPOINTS.QUESTIONS,
      {
        params: {
          page,
          pageSize: PAGE_SIZE,
          test_id: testId,
        },
      }
    );
    return response.data;
  },

  fetchAnswersForQuestion: async (questionId: string): Promise<AnswerProps[]> => {
    const response = await apiClient.get<ApiSuccessResponse<AnswerProps[]>>(
      QUESTION_ENDPOINTS.ANSWERS.LIST,
      {
        params: {
          question_id: questionId,
        },
      }
    );
    return response.data.data || [];
  },

  fetchAllQuestionsWithAnswers: async (testId: string): Promise<QuestionProps[]> => {
    // 1. Fetch first page to get metadata
    const firstResponse = await questionsService.fetchQuestionsPage(testId, 1);
    const firstPageData = firstResponse.data || [];
    const allQuestions: QuestionProps[] = [...firstPageData];

    const extractTotalPages = (meta: unknown): number => {
      if (meta && typeof meta === "object" && "totalPages" in meta) {
        return (meta as PaginationMeta).totalPages;
      }
      return 1;
    };

    const totalPages = extractTotalPages(firstResponse.meta);

    // 2. Fetch remaining pages in parallel (if any)
    if (totalPages > 1) {
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      
      const remainingResponses = await Promise.all(
        remainingPages.map((page) => questionsService.fetchQuestionsPage(testId, page))
      );
      
      const remainingData = remainingResponses.flatMap(
        (response) => response.data || []
      );
      allQuestions.push(...remainingData);
    }

    // 3. Fetch answers with concurrency limit
    // We attach answers to questions
    const questionsWithAnswers = await pLimit(
      allQuestions,
      async (question) => {
        const answers = await questionsService.fetchAnswersForQuestion(question.id);
        return { ...question, answers };
      },
      CONCURRENCY_LIMIT
    );

    return questionsWithAnswers;
  },
};
