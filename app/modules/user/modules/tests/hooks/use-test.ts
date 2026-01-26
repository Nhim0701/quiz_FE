/**
 * Main test store that combines all test-related stores
 * This provides a unified interface for components that need access to multiple stores
 */
import { useTestQuestionsStore } from "./use-test-questions";
import { useTestNavigationStore } from "./use-test-navigation";
import { useTestAnswersStore } from "./use-test-answers";
import { useTestFlagsStore } from "./use-test-flags";
import { useTestRevealedStore } from "./use-test-revealed";
import { useTestTimerStore } from "./use-test-timer";
import { useTestSubmissionStore } from "./use-test-submission";
import { useTestPauseStore } from "./use-test-pause";

/**
 * Hook to access all test stores in one place
 * Components can use this for convenience, or import individual stores directly
 */
export function useTestStore() {
  const questionsStore = useTestQuestionsStore();
  const navigationStore = useTestNavigationStore();
  const answersStore = useTestAnswersStore();
  const flagsStore = useTestFlagsStore();
  const revealedStore = useTestRevealedStore();
  const timerStore = useTestTimerStore();
  const submissionStore = useTestSubmissionStore();
  const pauseStore = useTestPauseStore();

  return {
    // Questions
    test: questionsStore.test,
    questions: questionsStore.questions,
    loading: questionsStore.loading,
    setLoading: questionsStore.setLoading,
    initializeTest: questionsStore.initializeTest,
    fetchAndInitializeTest: questionsStore.fetchAndInitializeTest,

    // Navigation
    currentIndex: navigationStore.currentIndex,
    setCurrentIndex: navigationStore.setCurrentIndex,
    goToQuestion: navigationStore.goToQuestion,
    goNext: navigationStore.goNext,
    goPrev: navigationStore.goPrev,

    // Answers
    answers: answersStore.answers,
    toggleAnswer: answersStore.toggleAnswer,

    // Flags
    flags: flagsStore.flags,
    toggleFlag: flagsStore.toggleFlag,

    // Revealed
    revealed: revealedStore.revealed,
    toggleRevealed: revealedStore.toggleRevealed,

    // Timer
    timeRemaining: timerStore.timeRemaining,
    setTimeRemaining: timerStore.setTimeRemaining,
    timeStarted: timerStore.timeStarted,
    setTimeStarted: timerStore.setTimeStarted,
    startTimer: timerStore.startTimer,

    // Submission
    submitting: submissionStore.submitting,
    setSubmitting: submissionStore.setSubmitting,
    submit: submissionStore.submit,
    finishTest: submissionStore.finishTest,

    // Pause
    isPaused: pauseStore.isPaused,
    pauseTest: pauseStore.pauseTest,
    resumeTest: pauseStore.resumeTest,
    clearPause: pauseStore.clearPause,
  };
}

// Export getState for direct access (used in take.tsx)
export const useTestStoreState = {
  getState: () => {
    const questionsState = useTestQuestionsStore.getState();
    const navigationState = useTestNavigationStore.getState();
    const answersState = useTestAnswersStore.getState();
    const flagsState = useTestFlagsStore.getState();
    const revealedState = useTestRevealedStore.getState();
    const timerState = useTestTimerStore.getState();
    const submissionState = useTestSubmissionStore.getState();
    const pauseState = useTestPauseStore.getState();

    return {
      test: questionsState.test,
      questions: questionsState.questions,
      loading: questionsState.loading,
      currentIndex: navigationState.currentIndex,
      answers: answersState.answers,
      flags: flagsState.flags,
      revealed: revealedState.revealed,
      timeRemaining: timerState.timeRemaining,
      timeStarted: timerState.timeStarted,
      submitting: submissionState.submitting,
      isPaused: pauseState.isPaused,
    };
  },
};
