import { create } from "zustand";
import { PAGINATION } from "@/constants";

export interface PaginationState {
  page: number;
  pageSize: number; // Internal storage is always number, "all" is converted to total
  total: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number | "all") => void;
  setTotal: (total: number) => void;
  reset: () => void;
}

export const usePaginationStore = create<PaginationState>((set, get) => ({
  page: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
  total: 0,
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => {
    if (pageSize === "all") {
      const { total } = get();
      set({ pageSize: total || PAGINATION.MAX_PAGE_SIZE_FOR_ALL, page: PAGINATION.DEFAULT_PAGE });
    } else {
      set({ pageSize, page: PAGINATION.DEFAULT_PAGE });
    }
  },
  setTotal: (total) => set({ total }),
  reset: () => set({ 
    page: PAGINATION.DEFAULT_PAGE, 
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE, 
    total: 0 
  }),
}));
