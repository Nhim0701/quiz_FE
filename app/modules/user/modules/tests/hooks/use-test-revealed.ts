import { create } from "zustand";
import { toggleRecordKey } from "../utils";

interface TestRevealedState {
  revealed: Record<string, boolean>;
  toggleRevealed: (questionId: string) => void;
  resetRevealed: () => void;
}

export const useTestRevealedStore = create<TestRevealedState>((set, get) => ({
  revealed: {},
  toggleRevealed: (questionId) =>
    set({ revealed: toggleRecordKey(get().revealed, questionId) }),
  resetRevealed: () => set({ revealed: {} }),
}));
