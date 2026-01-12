import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGINATION } from "@/constants";
import { useTranslation } from "@/i18n";
import type { PaginationProps } from "./types";

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [...PAGINATION.PAGE_SIZE_OPTIONS],
}: PaginationProps) {
  const { t } = useTranslation();
  // Check if "all" is selected (either explicitly or when pageSize >= total)
  const isAllSelected =
    (typeof pageSize === "string" && pageSize === "all") ||
    (typeof pageSize === "number" && total > 0 && pageSize >= total);

  const effectivePageSize = isAllSelected
    ? total
    : typeof pageSize === "number"
      ? pageSize
      : 10;
  const totalPages =
    effectivePageSize > 0 ? Math.ceil(total / effectivePageSize) : 1;
  const start = total > 0 ? (page - 1) * effectivePageSize + 1 : 0;
  const end = Math.min(page * effectivePageSize, total);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "all") {
      onPageSizeChange("all");
    } else {
      onPageSizeChange(Number(value));
    }
  };

  // Get visible page numbers (show current page and 1 page on each side)
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = PAGINATION.MAX_VISIBLE_PAGES;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible range
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(totalPages - 1, page + 1);

      // Adjust if we're near the start
      if (page <= 2) {
        endPage = Math.min(4, totalPages - 1);
      }

      // Adjust if we're near the end
      if (page >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }

      // Add ellipsis before if needed
      if (startPage > 2) {
        pages.push("ellipsis-start");
      }

      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis after if needed
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      {/* Left side: ItemPerPage selector and summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="items-per-page"
            className="text-sm text-muted-foreground"
          >
            {t("common.pagination.itemsPerPage")}
          </label>
          <select
            id="items-per-page"
            value={isAllSelected ? "all" : String(pageSize)}
            onChange={handlePageSizeChange}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t("common.pagination.itemsPerPage")}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size === "all" ? t("common.pagination.all") : size}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-muted-foreground">
          {(t as any)("common.pagination.summary", { start, end, total })}
        </p>
      </div>

      {/* Right side: Pagination buttons */}
      <div className="flex items-center gap-1">
        {/* First page button << */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page === 1 || totalPages === 0}
          className="h-8 w-8 p-0"
          aria-label={t("common.pagination.firstPage")}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page button < */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || totalPages === 0}
          className="h-8 w-8 p-0"
          aria-label={t("common.pagination.previousPage")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page number buttons */}
        {getVisiblePages().map((p, index) => {
          if (p === "ellipsis-start" || p === "ellipsis-end") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-sm text-muted-foreground"
              >
                ...
              </span>
            );
          }

          const pageNum = p as number;
          return (
            <Button
              key={pageNum}
              variant={pageNum === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className="h-8 w-8 p-0"
              aria-label={(t as any)("common.pagination.page", {
                page: pageNum,
              })}
            >
              {pageNum}
            </Button>
          );
        })}

        {/* Next page button > */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || totalPages === 0}
          className="h-8 w-8 p-0"
          aria-label={t("common.pagination.nextPage")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button >> */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || totalPages === 0}
          className="h-8 w-8 p-0"
          aria-label={t("common.pagination.lastPage")}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
