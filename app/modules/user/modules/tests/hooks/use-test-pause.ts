import { create } from "zustand";
import { testProgressStorage } from "../utils/test-progress-storage";
import { useTestQuestionsStore } from "./use-test-questions";
import { useTestNavigationStore } from "./use-test-navigation";
import { useTestAnswersStore } from "./use-test-answers";
import { useTestFlagsStore } from "./use-test-flags";
import { useTestTimerStore } from "./use-test-timer";

interface TestPauseState {
  isPaused: boolean;
  pauseTest: (testId: string) => void;
  resumeTest: (testId: string) => boolean;
  clearPause: () => void;
}

export const useTestPauseStore = create<TestPauseState>((set) => ({
  isPaused: false,

  pauseTest: (testId: string) => {
    const questionsStore = useTestQuestionsStore.getState();
    const navigationStore = useTestNavigationStore.getState();
    const answersStore = useTestAnswersStore.getState();
    const flagsStore = useTestFlagsStore.getState();
    const timerStore = useTestTimerStore.getState();

    const progress = {
      testId,
      answers: answersStore.answers,
      flags: flagsStore.flags,
      currentIndex: navigationStore.currentIndex,
      timeRemaining: timerStore.timeRemaining,
      timestamp: Date.now(),
    };

    testProgressStorage.save(progress);
    timerStore.setTimeStarted(false);
    set({ isPaused: true });
  },

  resumeTest: (testId: string): boolean => {
    const progress = testProgressStorage.loadByTestId(testId);
    if (!progress) return false;

    const questionsStore = useTestQuestionsStore.getState();
    const navigationStore = useTestNavigationStore.getState();
    const answersStore = useTestAnswersStore.getState();
    const flagsStore = useTestFlagsStore.getState();
    const timerStore = useTestTimerStore.getState();

    if (questionsStore.questions.length === 0) return false;

    navigationStore.setCurrentIndex(progress.currentIndex);
    answersStore.setAnswers(progress.answers);
    flagsStore.setFlags(progress.flags);
    timerStore.setTimeRemaining(progress.timeRemaining);
    timerStore.setTimeStarted(true);

    set({ isPaused: false });
    return true;
  },

  clearPause: () => {
    testProgressStorage.clear();
    set({ isPaused: false });
  },
}));
