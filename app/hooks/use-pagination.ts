import { useSearchParams } from "react-router";
import { useCallback } from "react";
import { PAGINATION } from "@/constants";

export interface PaginationState {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export const usePagination = (): PaginationState => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || PAGINATION.DEFAULT_PAGE;
  const pageSize =
    Number(searchParams.get("pageSize")) || PAGINATION.DEFAULT_PAGE_SIZE;

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams(
        (prev) => {
          prev.set("page", String(newPage));
          return prev;
        },
        { preventScrollReset: true }
      );
    },
    [setSearchParams]
  );

  const setPageSize = useCallback(
    (newPageSize: number) => {
      setSearchParams(
        (prev) => {
          prev.set("pageSize", String(newPageSize));
          prev.set("page", String(PAGINATION.DEFAULT_PAGE)); // Reset to page 1 on page size change
          return prev;
        },
        { preventScrollReset: true }
      );
    },
    [setSearchParams]
  );

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
  };
};
