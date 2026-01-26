interface TestProgress {
  testId: string;
  answers: Record<string, string[]>;
  flags: Record<string, boolean>;
  currentIndex: number;
  timeRemaining: number;
  timestamp: number;
}

const STORAGE_KEY = "test_progress";

export const testProgressStorage = {
  save: (progress: TestProgress): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save test progress:", error);
    }
  },

  load: (): TestProgress | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as TestProgress;
    } catch (error) {
      console.error("Failed to load test progress:", error);
      return null;
    }
  },

  loadByTestId: (testId: string): TestProgress | null => {
    const progress = testProgressStorage.load();
    if (!progress || progress.testId !== testId) return null;
    return progress;
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear test progress:", error);
    }
  },

  exists: (testId?: string): boolean => {
    const progress = testProgressStorage.load();
    if (!progress) return false;
    if (testId && progress.testId !== testId) return false;
    return true;
  },
};
