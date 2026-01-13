import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGINATION } from "@/constants";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib";
import type { PaginationProps } from "./types";

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const { t } = useTranslation();

  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;
  const start = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);

  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(Number(value));
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = PAGINATION.MAX_VISIBLE_PAGES;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    let startPage = Math.max(2, page - 1);
    let endPage = Math.min(totalPages - 1, page + 1);

    if (page <= 2) {
      endPage = Math.min(4, totalPages - 1);
    }

    if (page >= totalPages - 1) {
      startPage = Math.max(2, totalPages - 3);
    }

    if (startPage > 2) {
      pages.push("ellipsis-start");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push("ellipsis-end");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="items-per-page"
            className="text-sm text-muted-foreground"
          >
            {t("common.pagination.itemsPerPage")}
          </label>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger
              id="items-per-page"
              className="h-8 w-[70px]"
              aria-label={t("common.pagination.itemsPerPage")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          {(t as any)("common.pagination.summary", { start, end, total })}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page === 1 || totalPages === 0}
          className="h-8 w-8 p-0 shadow-sm hover:shadow-md transition-all duration-200"
          aria-label={t("common.pagination.firstPage")}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || totalPages === 0}
          className="h-8 w-8 p-0 shadow-sm hover:shadow-md transition-all duration-200"
          aria-label={t("common.pagination.previousPage")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

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
              className={cn(
                "h-8 w-8 p-0 transition-all duration-200",
                pageNum === page
                  ? "shadow-md hover:shadow-lg"
                  : "shadow-sm hover:shadow-md"
              )}
              aria-label={(t as any)("common.pagination.page", {
                page: pageNum,
              })}
            >
              {pageNum}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || totalPages === 0}
          className="h-8 w-8 p-0 shadow-sm hover:shadow-md transition-all duration-200"
          aria-label={t("common.pagination.nextPage")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || totalPages === 0}
          className="h-8 w-8 p-0 shadow-sm hover:shadow-md transition-all duration-200"
          aria-label={t("common.pagination.lastPage")}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
