import { create } from "zustand";

interface EditorState {
  isOpen: boolean;
  title: string;
  titleAction?: () => void;
  content: string;
  loading: boolean;
  loadingLabel: string;
  mode: "editor" | "html";
  setLoading: (loading: boolean) => void;
  open: (params: {
    content: string;
    title?: string;
    mode?: "editor" | "html";
    titleAction?: () => void;
    callback?: (content: string) => void;
    loadingLabel?: string;
  }) => void;
  close: (content?: string) => void;
  callback: (content: string) => void;
}

const DEFAULT_VALUES = {
  isOpen: false,
  title: "Editor",
  titleAction: undefined,
  mode: "editor",
  content: "",
  loading: false,
  loadingLabel: "Loading...",
  callback: () => {},
} as const;

export const useEditorStore = create<EditorState>((set, get) => ({
  ...DEFAULT_VALUES,
  open: ({ content, mode, title, titleAction, callback, loadingLabel }) =>
    set({
      isOpen: true,
      content,
      mode,
      title,
      titleAction,
      callback,
      loadingLabel: loadingLabel ?? DEFAULT_VALUES.loadingLabel,
    }),
  close: (content?: string) => {
    const { mode, callback } = get();
    mode === "editor" && callback && callback(content ?? "");
    set(DEFAULT_VALUES);
  },
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setLoading: (loading: boolean) => set({ loading }),
}));
