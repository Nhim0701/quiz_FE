import { create } from "zustand";

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotal: (total: number) => void;
  reset: () => void;
}

const defaultPageSize = 10;

export const usePaginationStore = create<PaginationState>((set) => ({
  page: 1,
  pageSize: defaultPageSize,
  total: 0,
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setTotal: (total) => set({ total }),
  reset: () => set({ page: 1, pageSize: defaultPageSize, total: 0 }),
}));
