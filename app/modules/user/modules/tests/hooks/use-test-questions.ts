import { create } from "zustand";
import type { ApiSuccessResponse, PaginationMeta } from "@/types";
import type { QuestionProps } from "@/modules/admin/modules/questions/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";
import { useTestNavigationStore } from "./use-test-navigation";
import { useTestAnswersStore } from "./use-test-answers";
import { useTestFlagsStore } from "./use-test-flags";
import { useTestRevealedStore } from "./use-test-revealed";
import { useTestTimerStore } from "./use-test-timer";
import { useTestSubmissionStore } from "./use-test-submission";
import { useTestsStore } from "@/modules/admin/modules/tests/hooks";
import { FILTER_QUERY_PARAMS } from "@/constants";

interface TestQuestionsState {
  // Questions
  questions: QuestionProps[];

  // Loading
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Initialize test
  initializeTest: (questions: QuestionProps[], timeLimit: number) => void;

  // Fetch and initialize questions
  fetchAndInitializeTest: (
    testId: string,
    setLoading?: (loading: boolean) => void,
    onError?: (message: string) => void
  ) => Promise<void>;
}

export const useTestQuestionsStore = create<TestQuestionsState>((set, get) => ({
  // Initial state
  questions: [],
  loading: false,

  // Loading
  setLoading: (loading) => set({ loading }),

  // Initialize test
  initializeTest: (questions, timeLimit) => {
    // Reset all related stores
    useTestNavigationStore.getState().setCurrentIndex(0);
    useTestAnswersStore.getState().resetAnswers();
    useTestFlagsStore.getState().resetFlags();
    useTestRevealedStore.getState().resetRevealed();
    // Convert timeLimit from minutes to seconds
    useTestTimerStore.getState().setTimeRemaining(timeLimit * 60);
    useTestTimerStore.getState().setTimeStarted(false);
    useTestSubmissionStore.getState().setSubmitting(false);

    set({
      questions,
      loading: false,
    });
  },

  // Fetch and initialize questions from test (with pagination support)
  fetchAndInitializeTest: async (testId: string, setLoading, onError) => {
    if (setLoading) setLoading(true);
    set({ loading: true });

    try {
      const allQuestions: QuestionProps[] = [];

      // Fetch first page to get pagination info
      const firstResponse = await apiClient.get<
        ApiSuccessResponse<QuestionProps[]>
      >(ENDPOINTS.QUESTIONS, {
        params: {
          page: 1,
          // Request params in camelCase - will be converted to snake_case by interceptor
          pageSize: 100,
          [FILTER_QUERY_PARAMS.FILTER_KEY(1)]: "test_id",
          [FILTER_QUERY_PARAMS.FILTER_VALUE(1)]: testId,
        },
      });

      const firstPageData = firstResponse.data.data || [];
      allQuestions.push(...firstPageData);

      // Check if there's pagination meta and fetch remaining pages
      // Meta is already converted to camelCase by interceptor
      const meta = firstResponse.data.meta;
      let totalPages = 1;
      if (meta && typeof meta === "object" && "totalPages" in meta) {
        const paginationMeta = meta as PaginationMeta;
        totalPages = paginationMeta.totalPages;
      }

      // Fetch remaining pages if any
      if (totalPages > 1) {
        const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) =>
          apiClient.get<ApiSuccessResponse<QuestionProps[]>>(
            ENDPOINTS.QUESTIONS,
            {
              params: {
                page: i + 2,
                pageSize: 100,
                [FILTER_QUERY_PARAMS.FILTER_KEY(1)]: "test_id",
                [FILTER_QUERY_PARAMS.FILTER_VALUE(1)]: testId,
              },
            }
          )
        );

        const remainingResponses = await Promise.all(remainingPages);
        remainingResponses.forEach((response) => {
          const pageData = response.data.data || [];
          allQuestions.push(...pageData);
        });
      }

      // Get test to get timeLimit
      const getTestById = useTestsStore.getState().getTestById;
      const test = await getTestById(testId);

      if (!test) {
        throw new Error("Test not found");
      }

      const { initializeTest } = get();
      initializeTest(allQuestions, test.timeLimit);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch questions";
      if (onError) onError(errorMessage);
      throw error;
    } finally {
      if (setLoading) setLoading(false);
      set({ loading: false });
    }
  },
}));
