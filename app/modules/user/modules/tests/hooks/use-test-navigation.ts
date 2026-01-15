import { create } from "zustand";
import { useTestQuestionsStore } from "./use-test-questions";

interface TestNavigationState {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
}

const clampIndex = (index: number, maxIndex: number): number => {
  return Math.max(0, Math.min(maxIndex, index));
};

export const useTestNavigationStore = create<TestNavigationState>((set) => ({
  currentIndex: 0,

  setCurrentIndex: (index) => set({ currentIndex: index }),

  goToQuestion: (index) => {
    const { questions } = useTestQuestionsStore.getState();
    const maxIndex = Math.max(0, questions.length - 1);
    set({ currentIndex: clampIndex(index, maxIndex) });
  },

  goNext: () => {
    const { questions } = useTestQuestionsStore.getState();
    const maxIndex = Math.max(0, questions.length - 1);
    set((state) => ({
      currentIndex: clampIndex(state.currentIndex + 1, maxIndex),
    }));
  },

  goPrev: () => {
    set((state) => ({
      currentIndex: Math.max(0, state.currentIndex - 1),
    }));
  },
}));
