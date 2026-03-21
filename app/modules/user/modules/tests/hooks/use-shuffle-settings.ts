import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ShuffleMode = "questions" | "answers" | "both" | null;

interface ShuffleSettingsState {
  mode: ShuffleMode;
  setMode: (mode: ShuffleMode) => void;
  toggleMode: (mode: Exclude<ShuffleMode, null>) => void;
}

export const useShuffleSettingsStore = create<ShuffleSettingsState>()(
  persist(
    (set, get) => ({
      mode: null,
      setMode: (mode) => set({ mode }),
      toggleMode: (mode) => {
        const current = get().mode;
        set({ mode: current === mode ? null : mode });
      },
    }),
    {
      name: "shuffle_settings",
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);
