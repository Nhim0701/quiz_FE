import { create } from "zustand";

interface EditorState {
  isOpen: boolean;
  title: string;
  readonly: boolean;
  open: (
    content: string,
    readonly?: boolean,
    onCloseCallback?: (content: string) => void
  ) => void;
  close: (content: string) => void;
  content: string;
  onCloseCallback: (content: string) => void;
}

const DEFAULT_VALUES = {
  isOpen: false,
  title: "Editor",
  readonly: false,
  side: "right" as const,
  content: "",
  onCloseCallback: () => {},
} as const;

export const useEditorStore = create<EditorState>((set, get) => ({
  ...DEFAULT_VALUES,
  open: (
    content: string,
    readonly: boolean = false,
    onCloseCallback?: (content: string) => void
  ) => set({ isOpen: true, content, readonly, onCloseCallback }),
  close: (content) => {
    set({ isOpen: false, readonly: false });
    get().onCloseCallback(content);
  },
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
