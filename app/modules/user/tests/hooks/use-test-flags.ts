import { create } from "zustand";

interface TestFlagsState {
  // Flags
  flags: Record<string, boolean>; // questionId -> true/false
  toggleFlag: (questionId: string) => void;
  resetFlags: () => void;
}

export const useTestFlagsStore = create<TestFlagsState>((set, get) => ({
  // Initial state
  flags: {},

  // Flags
  toggleFlag: (questionId) => {
    const { flags } = get();
    set({
      flags: {
        ...flags,
        [questionId]: !flags[questionId],
      },
    });
  },

  resetFlags: () => set({ flags: {} }),
}));
