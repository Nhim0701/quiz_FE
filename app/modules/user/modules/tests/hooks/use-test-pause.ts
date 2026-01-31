import { create } from "zustand";
import { testProgressStorage } from "../utils/test-progress-storage";
import { getTestStoresForPause } from "./store-coordinator";

let skipSaveForTestId: string | null = null;

interface TestPauseState {
  isPaused: boolean;
  pauseTest: (testId: string) => void;
  resumeTest: (testId: string) => boolean;
  clearPause: (testId?: string) => void;
}

export const useTestPauseStore = create<TestPauseState>((set) => ({
  isPaused: false,
  pauseTest: (testId) => {
    if (skipSaveForTestId === testId) {
      skipSaveForTestId = null;
      const { timer } = getTestStoresForPause();
      timer.setTimeStarted(false);
      set({ isPaused: true });
      return;
    }
    const { answers, flags, navigation, timer } = getTestStoresForPause();
    testProgressStorage.save({
      testId,
      answers: answers.answers,
      flags: flags.flags,
      currentIndex: navigation.currentIndex,
      timeRemaining: timer.timeRemaining,
      timestamp: Date.now(),
    });
    timer.setTimeStarted(false);
    set({ isPaused: true });
  },
  resumeTest: (testId): boolean => {
    const progress = testProgressStorage.loadByTestId(testId);
    if (!progress) return false;
    const { questions, navigation, answers, flags, timer } =
      getTestStoresForPause();
    if (questions.questions.length === 0) return false;
    navigation.setCurrentIndex(progress.currentIndex);
    answers.setAnswers(progress.answers);
    flags.setFlags(progress.flags);
    timer.setTimeRemaining(progress.timeRemaining);
    timer.setTimeStarted(true);
    set({ isPaused: false });
    return true;
  },
  clearPause: (testId) => {
    if (testId) {
      testProgressStorage.clearByTestId(testId);
      skipSaveForTestId = testId;
    }
    set({ isPaused: false });
  },
}));
