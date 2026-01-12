import { create } from "zustand";
import { useTestQuestionsStore } from "./use-test-questions";

interface TestNavigationState {
  // Test progress
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
}

export const useTestNavigationStore = create<TestNavigationState>(
  (set, get) => ({
    // Initial state
    currentIndex: 0,

    // Current index
    setCurrentIndex: (index) => set({ currentIndex: index }),

    goToQuestion: (index) => {
      const { questions } = useTestQuestionsStore.getState();
      set({ currentIndex: Math.max(0, Math.min(questions.length - 1, index)) });
    },

    goNext: () => {
      const { questions } = useTestQuestionsStore.getState();
      const { currentIndex } = get();
      set({ currentIndex: Math.min(questions.length - 1, currentIndex + 1) });
    },

    goPrev: () => {
      const { currentIndex } = get();
      set({ currentIndex: Math.max(0, currentIndex - 1) });
    },
  })
);
