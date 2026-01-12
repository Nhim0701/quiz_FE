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

export const usePaginationStore = create<PaginationState>((set, get) => ({
  page: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
  total: 0,
  currentRoute: null,
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => {
    set({ pageSize, page: PAGINATION.DEFAULT_PAGE });
  },
  setTotal: (total) => set({ total }),
  setCurrentRoute: (route: string) => {
    const { currentRoute } = get();
    // If route changed, reset pagination
    if (currentRoute !== null && currentRoute !== route) {
      set({
        currentRoute: route,
        page: PAGINATION.DEFAULT_PAGE,
        pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
        total: 0,
      });
    } else {
      // Same route, just update the route
      set({ currentRoute: route });
    }
  },
  reset: () =>
    set({
      page: PAGINATION.DEFAULT_PAGE,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      total: 0,
      currentRoute: null,
    }),
}));
