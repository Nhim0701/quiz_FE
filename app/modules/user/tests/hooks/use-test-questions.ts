import { create } from "zustand";
import type { ApiSuccessResponse, PaginationMeta } from "@/types";
import type { QuestionProps } from "@/hooks/use-questions";
import apiClient from "@/lib/axios";
import { TESTS_API_ENDPOINTS, TIME_CONSTANTS } from "../constants";
import { useTestNavigationStore } from "./use-test-navigation";
import { useTestAnswersStore } from "./use-test-answers";
import { useTestFlagsStore } from "./use-test-flags";
import { useTestRevealedStore } from "./use-test-revealed";
import { useTestTimerStore } from "./use-test-timer";
import { useTestSubmissionStore } from "./use-test-submission";

interface TestQuestionsState {
  // Questions
  questions: QuestionProps[];

  // Loading
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Initialize test
  initializeTest: (testId: string, questions: QuestionProps[]) => void;

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
  initializeTest: (testId, questions) => {
    // Reset all related stores
    useTestNavigationStore.getState().setCurrentIndex(0);
    useTestAnswersStore.getState().resetAnswers();
    useTestFlagsStore.getState().resetFlags();
    useTestRevealedStore.getState().resetRevealed();
    useTestTimerStore
      .getState()
      .setTimeRemaining(questions.length * TIME_CONSTANTS.SECONDS_PER_QUESTION);
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
      >(TESTS_API_ENDPOINTS.QUESTIONS(testId), {
        params: {
          page: 1,
          // Request params in camelCase - will be converted to snake_case by interceptor
          pageSize: 100,
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
            `${TESTS_API_ENDPOINTS.QUESTIONS(testId)}`,
            { params: { page: i + 2, pageSize: 100 } }
          )
        );

        const remainingResponses = await Promise.all(remainingPages);
        remainingResponses.forEach((response) => {
          const pageData = response.data.data || [];
          allQuestions.push(...pageData);
        });
      }

      const { initializeTest } = get();
      initializeTest(testId, allQuestions);
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
