import { create } from "zustand";
import { useTestQuestionsStore } from "./use-test-questions";

interface TestTimerState {
  // Timer
  timeRemaining: number; // in seconds
  setTimeRemaining: (time: number) => void;
  timeStarted: boolean;
  setTimeStarted: (started: boolean) => void;

  // Timer management
  startTimer: () => void;
}

export const useTestTimerStore = create<TestTimerState>((set, get) => ({
  // Initial state
  timeRemaining: 0,
  timeStarted: false,

  // Timer
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setTimeStarted: (started) => set({ timeStarted: started }),

  // Timer management
  startTimer: () => {
    const { questions, loading } = useTestQuestionsStore.getState();
    const { timeStarted } = get();
    if (!loading && questions.length > 0 && !timeStarted) {
      set({ timeStarted: true });
    }
  },
}));
