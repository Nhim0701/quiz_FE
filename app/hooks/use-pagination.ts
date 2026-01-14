import { create } from "zustand";
import { PAGINATION } from "@/constants";

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  currentRoute: string | null;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotal: (total: number) => void;
  setCurrentRoute: (route: string) => void;
  reset: () => void;
}

// Default pagination values
const DEFAULT_VALUES = {
  page: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
  total: 0,
  currentRoute: null as string | null,
} as const;

// Helper to get reset state
const getResetState = () => ({
  page: DEFAULT_VALUES.page,
  pageSize: DEFAULT_VALUES.pageSize,
  total: DEFAULT_VALUES.total,
  currentRoute: DEFAULT_VALUES.currentRoute,
});

export const usePaginationStore = create<PaginationState>((set, get) => ({
  ...DEFAULT_VALUES,
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => {
    set({
      pageSize,
      page: DEFAULT_VALUES.page,
    });
  },
  setTotal: (total) => set({ total }),
  setCurrentRoute: (route: string) => {
    const { currentRoute } = get();
    const isRouteChanged = currentRoute !== null && currentRoute !== route;

    if (isRouteChanged) {
      // Route changed - reset pagination
      set({
        currentRoute: route,
        page: DEFAULT_VALUES.page,
        pageSize: DEFAULT_VALUES.pageSize,
        total: DEFAULT_VALUES.total,
      });
    } else {
      // Same route - just update the route
      set({ currentRoute: route });
    }
  },
  reset: () => set(getResetState()),
}));
