import { create } from "zustand";
import { toggleRecordKey } from "../utils";

interface TestFlagsState {
  flags: Record<string, boolean>;
  toggleFlag: (questionId: string) => void;
  setFlags: (flags: Record<string, boolean>) => void;
  resetFlags: () => void;
}

export const useTestFlagsStore = create<TestFlagsState>((set, get) => ({
  flags: {},
  toggleFlag: (questionId) =>
    set({ flags: toggleRecordKey(get().flags, questionId) }),
  setFlags: (flags) => set({ flags }),
  resetFlags: () => set({ flags: {} }),
}));
