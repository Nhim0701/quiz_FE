import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { STORAGE_KEYS, THEME_VALUES, TOAST_CLASSES } from "@/constants";
import type { ReactNode } from "react";

type Theme = "light" | "dark";

interface DialogConfig {
  title?: ReactNode;
  titleClassName?: string;
  content?: ReactNode;
  contentContainerClassName?: string;
  footer?: ReactNode;
  footerContainerClassName?: string;
}

interface DialogState {
  isDialogOpen: boolean;
  dialogTitle?: ReactNode;
  dialogTitleClassName?: string;
  dialogContent?: ReactNode;
  dialogContentContainerClassName?: string;
  dialogFooter?: ReactNode;
  dialogFooterContainerClassName?: string;
}

const DEFAULT_DIALOG_STATE: DialogState = {
  isDialogOpen: false,
  dialogTitle: undefined,
  dialogTitleClassName: undefined,
  dialogContent: undefined,
  dialogContentContainerClassName: undefined,
  dialogFooter: undefined,
  dialogFooterContainerClassName: undefined,
};

interface AppState extends DialogState {
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
  showDialog: (config: DialogConfig) => void;
  closeDialog: () => void;
}

// Helper function to get initial theme
// Always return default on server to avoid hydration mismatch
const getInitialTheme = (): Theme => THEME_VALUES.LIGHT;

// Helper function to apply theme to DOM
const applyTheme = (theme: Theme) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.toggle(THEME_VALUES.DARK, theme === THEME_VALUES.DARK);
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
      // Dialog state - initialize with default values
      ...DEFAULT_DIALOG_STATE,
      showDialog: (config: DialogConfig) => {
        set({
          isDialogOpen: true,
          dialogTitle: config.title,
          dialogTitleClassName: config.titleClassName,
          dialogContent: config.content,
          dialogContentContainerClassName: config.contentContainerClassName,
          dialogFooter: config.footer,
          dialogFooterContainerClassName: config.footerContainerClassName,
        });
      },
      closeDialog: () => {
        set(DEFAULT_DIALOG_STATE);
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
      // Only persist theme, not other state
      partialize: (state) => ({ theme: state.theme }), // Don't persist loading state
      // Initialize theme class on load
      // Note: Theme is already applied by inline script in root.tsx before hydration
      // This ensures store state matches what's in the DOM after hydration
      onRehydrateStorage: () => (state) => {
        if (typeof window === "undefined") return;

        if (state) {
          // Store has persisted state, ensure DOM matches (should already match)
          applyTheme(state.theme);
        } else {
          // No persisted state - sync store with what inline script set
          const isDark = document.documentElement.classList.contains(
            THEME_VALUES.DARK
          );
          useApp.setState({
            theme: isDark ? THEME_VALUES.DARK : THEME_VALUES.LIGHT,
          });
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
