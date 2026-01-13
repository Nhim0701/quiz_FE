import { create } from "zustand";

interface TestRevealedState {
  // Revealed questions
  revealed: Record<string, boolean>; // questionId -> true/false
  toggleRevealed: (questionId: string) => void;
  resetRevealed: () => void;
}

export const useTestRevealedStore = create<TestRevealedState>((set, get) => ({
  // Initial state
  revealed: {},

  // Revealed
  toggleRevealed: (questionId) => {
    const { revealed } = get();
    set({
      revealed: {
        ...revealed,
        [questionId]: !revealed[questionId],
      },
    });
  },

  resetRevealed: () => set({ revealed: {} }),
}));
