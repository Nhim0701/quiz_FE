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
import {
  useTestsStore,
  type TestProps,
} from "@/modules/admin/modules/tests/hooks";
import { FILTER_QUERY_PARAMS } from "@/constants";

interface TestQuestionsState {
  test: TestProps | null;
  questions: QuestionProps[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  initializeTest: (questions: QuestionProps[], timeLimit: number) => void;
  fetchAndInitializeTest: (
    testId: string,
    setLoading?: (loading: boolean) => void,
    onError?: (message: string) => void
  ) => Promise<void>;
}

const PAGE_SIZE = 100;

const resetAllStores = () => {
  useTestNavigationStore.getState().setCurrentIndex(0);
  useTestAnswersStore.getState().resetAnswers();
  useTestFlagsStore.getState().resetFlags();
  useTestRevealedStore.getState().resetRevealed();
  const timerStore = useTestTimerStore.getState();
  timerStore.setTimeStarted(false);
  useTestSubmissionStore.getState().setSubmitting(false);
};

const fetchQuestionsPage = async (
  testId: string,
  page: number
): Promise<ApiSuccessResponse<QuestionProps[]>> => {
  const response = await apiClient.get<ApiSuccessResponse<QuestionProps[]>>(
    ENDPOINTS.QUESTIONS,
    {
      params: {
        page,
        pageSize: PAGE_SIZE,
        [FILTER_QUERY_PARAMS.FILTER_KEY(1)]: "test_id",
        [FILTER_QUERY_PARAMS.FILTER_VALUE(1)]: testId,
      },
    }
  );
  return response.data as ApiSuccessResponse<QuestionProps[]>;
};

const extractTotalPages = (meta: unknown): number => {
  if (meta && typeof meta === "object" && "totalPages" in meta) {
    return (meta as PaginationMeta).totalPages;
  }
  return 1;
};

const fetchAllQuestions = async (testId: string): Promise<QuestionProps[]> => {
  const firstResponse = await fetchQuestionsPage(testId, 1);
  const firstPageData = firstResponse.data || [];
  const allQuestions: QuestionProps[] = [...firstPageData];

  const totalPages = extractTotalPages(firstResponse.meta);

  if (totalPages > 1) {
    const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) =>
      fetchQuestionsPage(testId, i + 2)
    );

    const remainingResponses = await Promise.all(remainingPages);
    const remainingData = remainingResponses.flatMap(
      (response) => response.data || []
    );
    allQuestions.push(...remainingData);
  }

  return allQuestions;
};

export const useTestQuestionsStore = create<TestQuestionsState>((set) => ({
  test: null,
  questions: [],
  loading: false,

  setLoading: (loading) => set({ loading }),

  initializeTest: (questions, timeLimit) => {
    resetAllStores();
    useTestTimerStore.getState().setTimeRemaining(timeLimit * 60);
    set({ questions, loading: false });
  },

  fetchAndInitializeTest: async (testId: string, setLoading, onError) => {
    setLoading?.(true);
    set({ loading: true });

    try {
      const allQuestions = await fetchAllQuestions(testId);
      const getTestById = useTestsStore.getState().getTestById;
      const test = await getTestById(testId);

      if (!test) {
        throw new Error("Test not found");
      }

      const { initializeTest } = useTestQuestionsStore.getState();
      set({ test });
      initializeTest(allQuestions, test.timeLimit);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch questions";
      onError?.(errorMessage);
      throw error;
    } finally {
      setLoading?.(false);
      set({ loading: false });
    }
  },
}));
