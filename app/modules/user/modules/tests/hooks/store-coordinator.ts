import { useTestQuestionsStore } from "./use-test-questions";
import { useTestNavigationStore } from "./use-test-navigation";
import { useTestAnswersStore } from "./use-test-answers";
import { useTestFlagsStore } from "./use-test-flags";
import { useTestTimerStore } from "./use-test-timer";

export const getTestStoresForPause = () => {
  return {
    questions: useTestQuestionsStore.getState(),
    navigation: useTestNavigationStore.getState(),
    answers: useTestAnswersStore.getState(),
    flags: useTestFlagsStore.getState(),
    timer: useTestTimerStore.getState(),
  };
}
