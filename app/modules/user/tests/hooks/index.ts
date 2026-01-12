// Export individual stores
export { useTestQuestionsStore } from "./use-test-questions";
export { useTestNavigationStore } from "./use-test-navigation";
export { useTestAnswersStore } from "./use-test-answers";
export { useTestFlagsStore } from "./use-test-flags";
export { useTestRevealedStore } from "./use-test-revealed";
export { useTestTimerStore } from "./use-test-timer";
export { useTestSubmissionStore } from "./use-test-submission";

// Export main combined store for backward compatibility
export { useTestStore, useTestStoreState } from "./use-test";
