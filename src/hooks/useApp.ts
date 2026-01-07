import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

const THEME_STORAGE_KEY = "theme";

type Theme = "light" | "dark";

interface AppState {
  theme: Theme;
  loading: boolean;
  error: string | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  showError: (error: string, options?: Parameters<typeof toast.error>[1]) => void;
  showSuccess: (message: string, options?: Parameters<typeof toast.success>[1]) => void;
  showInfo: (message: string, options?: Parameters<typeof toast.info>[1]) => void;
  showWarning: (message: string, options?: Parameters<typeof toast.warning>[1]) => void;
  clearError: () => void;
}

// Helper function to get initial theme
const getInitialTheme = (): Theme => {
  // Check localStorage first
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }

    // Otherwise, detect system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  }

  return "light";
};

// Helper function to apply theme to DOM
const applyTheme = (theme: Theme) => {
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
};

const useApp = create<AppState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      loading: false,
      error: null,
      setTheme: (theme: Theme) => {
        if (theme === "light" || theme === "dark") {
          set({ theme });
          applyTheme(theme);
        }
      },
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          applyTheme(newTheme);
          return { theme: newTheme };
        });
      },
      setLoading: (loading: boolean) => {
        console.log("setLoading", loading);
        set({ loading });
      },
      setError: (error: string | null) => {
        set({ error });
      },
      showError: (error: string, options?: Parameters<typeof toast.error>[1]) => {
        set({ error });
        toast.error(error, {
          ...options,
          className: "toast-error",
        });
      },
      showSuccess: (message: string, options?: Parameters<typeof toast.success>[1]) => {
        toast.success(message, {
          ...options,
          className: "toast-success",
        });
      },
      showInfo: (message: string, options?: Parameters<typeof toast.info>[1]) => {
        toast.info(message, {
          ...options,
          className: "toast-info",
        });
      },
      showWarning: (message: string, options?: Parameters<typeof toast.warning>[1]) => {
        toast.warning(message, {
          ...options,
          className: "toast-warning",
        });
      },
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      // Only persist theme, not other state
      partialize: (state) => ({ theme: state.theme }), // Don't persist loading state
      // Initialize theme class on load
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        } else {
          // If no persisted state, apply initial theme
          const initialTheme = getInitialTheme();
          applyTheme(initialTheme);
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
