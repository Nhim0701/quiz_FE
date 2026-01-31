import { create } from "zustand";
import { useTestQuestionsStore } from "./use-test-questions";

interface TestNavigationState {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
}

const clampIndex = (index: number, maxIndex: number) =>
  Math.max(0, Math.min(maxIndex, index));

const getMaxIndex = () =>
  Math.max(0, useTestQuestionsStore.getState().questions.length - 1);

export const useTestNavigationStore = create<TestNavigationState>((set) => ({
  currentIndex: 0,
  setCurrentIndex: (index) => set({ currentIndex: index }),
  goToQuestion: (index) =>
    set({ currentIndex: clampIndex(index, getMaxIndex()) }),
  goNext: () =>
    set((state) => ({
      currentIndex: clampIndex(state.currentIndex + 1, getMaxIndex()),
    })),
  goPrev: () =>
    set((state) => ({ currentIndex: Math.max(0, state.currentIndex - 1) })),
}));
