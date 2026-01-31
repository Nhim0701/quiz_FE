export interface TestProgress {
  testId: string;
  answers: Record<string, string[]>;
  flags: Record<string, boolean>;
  currentIndex: number;
  timeRemaining: number;
  timestamp: number;
}

const STORAGE_KEY_PREFIX = "test_progress_";

function storageKey(testId: string): string {
  return `${STORAGE_KEY_PREFIX}${testId}`;
}

export const testProgressStorage = {
  save: (progress: TestProgress): void => {
    try {
      localStorage.setItem(storageKey(progress.testId), JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save test progress:", error);
    }
  },

  loadByTestId: (testId: string): TestProgress | null => {
    try {
      const stored = localStorage.getItem(storageKey(testId));
      if (!stored) return null;
      return JSON.parse(stored) as TestProgress;
    } catch (error) {
      console.error("Failed to load test progress:", error);
      return null;
    }
  },

  clearByTestId: (testId: string): void => {
    try {
      localStorage.removeItem(storageKey(testId));
    } catch (error) {
      console.error("Failed to clear test progress:", error);
    }
  },

  exists: (testId: string): boolean => {
    return localStorage.getItem(storageKey(testId)) !== null;
  },
};
