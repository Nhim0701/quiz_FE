import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { STORAGE_KEYS, THEME_VALUES, TOAST_CLASSES } from "@/constants";

type Theme = "light" | "dark";

interface AppState {
  theme: Theme;
  loading: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
  showError: (
    error: string,
    options?: Parameters<typeof toast.error>[1]
  ) => void;
  showSuccess: (
    message: string,
    options?: Parameters<typeof toast.success>[1]
  ) => void;
  showInfo: (
    message: string,
    options?: Parameters<typeof toast.info>[1]
  ) => void;
  showWarning: (
    message: string,
    options?: Parameters<typeof toast.warning>[1]
  ) => void;
}

// Helper function to get initial theme
// Always return default on server to avoid hydration mismatch
const getInitialTheme = (): Theme => {
  return THEME_VALUES.LIGHT;
};

// Helper function to apply theme to DOM
const applyTheme = (theme: Theme) => {
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    theme === THEME_VALUES.LIGHT
      ? root.classList.remove(THEME_VALUES.DARK)
      : root.classList.add(THEME_VALUES.DARK);
  }
};

// Base arrow function for toast notifications
const createToastHandler = <
  T extends
    | typeof toast.error
    | typeof toast.success
    | typeof toast.info
    | typeof toast.warning,
>(
  toastFn: T,
  className: string
) => {
  return (message: string, options?: Parameters<T>[1]) => {
    toastFn(message, {
      ...options,
      className,
    });
  };
};

const useApp = create<AppState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      loading: false,
      setTheme: (theme: Theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () => {
        set((state) => {
          const newTheme =
            state.theme === THEME_VALUES.LIGHT
              ? THEME_VALUES.DARK
              : THEME_VALUES.LIGHT;
          applyTheme(newTheme);
          return { theme: newTheme };
        });
      },
      setLoading: (loading: boolean) => {
        set({ loading });
      },
      showError: createToastHandler(toast.error, TOAST_CLASSES.ERROR),
      showSuccess: createToastHandler(toast.success, TOAST_CLASSES.SUCCESS),
      showInfo: createToastHandler(toast.info, TOAST_CLASSES.INFO),
      showWarning: createToastHandler(toast.warning, TOAST_CLASSES.WARNING),
    }),
    {
      name: STORAGE_KEYS.THEME,
      // Only persist theme, not other state
      partialize: (state) => ({ theme: state.theme }), // Don't persist loading state
      // Initialize theme class on load
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        } else {
          // If no persisted state, detect system preference or use default
          if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STORAGE_KEYS.THEME);
            if (stored === THEME_VALUES.LIGHT || stored === THEME_VALUES.DARK) {
              applyTheme(stored);
              return;
            }

            // Detect system preference
            if (
              window.matchMedia &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
            ) {
              applyTheme(THEME_VALUES.DARK);
              return;
            }
          }
          applyTheme(THEME_VALUES.LIGHT);
        }
      },
    }
  )
);

export default useApp;

// Export hook for theme only (for sonner component)
export const useTheme = () => {
  const theme = useApp((state) => state.theme);
  return { theme };
};
