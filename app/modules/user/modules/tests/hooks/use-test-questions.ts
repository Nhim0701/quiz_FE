import { create } from "zustand";
import type { QuestionProps } from "@/modules/admin/modules/questions/types";
import { useTestNavigationStore } from "./use-test-navigation";
import { useTestAnswersStore } from "./use-test-answers";
import { useTestFlagsStore } from "./use-test-flags";
import { useTestRevealedStore } from "./use-test-revealed";
import { useTestTimerStore } from "./use-test-timer";
import { useTestSubmissionStore } from "./use-test-submission";
import { useTestPauseStore } from "./use-test-pause";
import {
  useTestsStore,
  type TestProps,
} from "@/modules/admin/modules/tests/hooks";
import { shuffleQuestionsAndAnswers } from "../utils";
import { questionsService } from "../services/questions.service";

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

const resetAllStores = (): void => {
  useTestNavigationStore.getState().setCurrentIndex(0);
  useTestAnswersStore.getState().resetAnswers();
  useTestFlagsStore.getState().resetFlags();
  useTestRevealedStore.getState().resetRevealed();
  useTestTimerStore.getState().setTimeStarted(false);
  useTestSubmissionStore.getState().setSubmitting(false);
  useTestPauseStore.getState().clearPause();
}

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
      const allQuestions = await questionsService.fetchAllQuestionsWithAnswers(testId);
      const shuffledQuestions = shuffleQuestionsAndAnswers(allQuestions);
      const getTestById = useTestsStore.getState().getTestById;
      const test = await getTestById(testId);

      if (!test) {
        throw new Error("Test not found");
      }

      const { initializeTest } = useTestQuestionsStore.getState();
      set({ test });
      initializeTest(shuffledQuestions, test.timeLimit);
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
