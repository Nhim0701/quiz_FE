import { create } from "zustand";
import { useTestQuestionsStore } from "./use-test-questions";

interface TestTimerState {
  timeRemaining: number;
  setTimeRemaining: (time: number) => void;
  timeStarted: boolean;
  setTimeStarted: (started: boolean) => void;
  startTimer: () => void;
}

export const useTestTimerStore = create<TestTimerState>((set, get) => ({
  timeRemaining: 0,
  timeStarted: false,
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setTimeStarted: (started) => set({ timeStarted: started }),
  startTimer: () => {
    const { questions, loading } = useTestQuestionsStore.getState();
    const { timeStarted } = get();
    if (!loading && questions.length > 0 && !timeStarted) {
      set({ timeStarted: true });
    }
  },
}));
