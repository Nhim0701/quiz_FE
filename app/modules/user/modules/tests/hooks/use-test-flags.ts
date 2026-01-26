import { create } from "zustand";

interface TestFlagsState {
  flags: Record<string, boolean>;
  toggleFlag: (questionId: string) => void;
  setFlags: (flags: Record<string, boolean>) => void;
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

  setFlags: (flags) => set({ flags }),
  resetFlags: () => set({ flags: {} }),
}));
