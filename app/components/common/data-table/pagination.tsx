import { useMemo } from "react";
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
import type { TranslationParams, TypedTFunction } from "@/i18n";

// Constants for button styling
const NAV_BUTTON_CLASSES =
  "h-8 w-8 p-0 shadow-sm hover:shadow-md transition-all duration-200 border-blue-500/50 text-blue-600 hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-blue-600 dark:border-blue-400/50 dark:text-blue-400 dark:hover:from-blue-600 dark:hover:to-indigo-700 dark:hover:border-blue-500 disabled:hover:bg-transparent disabled:hover:text-blue-600 dark:disabled:hover:text-blue-400";

const ACTIVE_PAGE_CLASSES =
  "bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white border-blue-600 dark:border-blue-500 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800";

const INACTIVE_PAGE_CLASSES =
  "border-blue-500/50 text-blue-600 hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-blue-600 dark:border-blue-400/50 dark:text-blue-400 dark:hover:from-blue-600 dark:hover:to-indigo-700 dark:hover:border-blue-500 shadow-sm hover:shadow-md";

interface PaginationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}

function PaginationButton({
  onClick,
  disabled,
  ariaLabel,
  children,
  className,
}: PaginationButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(NAV_BUTTON_CLASSES, className)}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  );
}

interface PageButtonProps {
  pageNum: number;
  isActive: boolean;
  onClick: () => void;
  ariaLabel: string;
}

function PageButton({
  pageNum,
  isActive,
  onClick,
  ariaLabel,
}: PageButtonProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 w-8 p-0 transition-all duration-200",
        isActive ? ACTIVE_PAGE_CLASSES : INACTIVE_PAGE_CLASSES
      )}
      aria-label={ariaLabel}
    >
      {pageNum}
    </Button>
  );
}

function getVisiblePages(
  totalPages: number,
  currentPage: number
): (number | string)[] {
  const pages: (number | string)[] = [];
  const maxVisible = PAGINATION.MAX_VISIBLE_PAGES;

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  pages.push(1);

  let startPage = Math.max(2, currentPage - 1);
  let endPage = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 2) {
    endPage = Math.min(4, totalPages - 1);
  }

  if (currentPage >= totalPages - 1) {
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
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const { t: typedT } = useTranslation();
  const t = typedT as TypedTFunction & {
    (key: string, params?: Record<string, string | number>): string;
  };

  const totalPages = useMemo(
    () => (pageSize > 0 ? Math.ceil(total / pageSize) : 1),
    [pageSize, total]
  );

  const { start, end } = useMemo(() => {
    const calculatedStart = total > 0 ? (page - 1) * pageSize + 1 : 0;
    const calculatedEnd = Math.min(page * pageSize, total);
    return { start: calculatedStart, end: calculatedEnd };
  }, [page, pageSize, total]);

  const visiblePages = useMemo(
    () => getVisiblePages(totalPages, page),
    [totalPages, page]
  );

  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(Number(value));
  };

  const isFirstPage = page === 1 || totalPages === 0;
  const isLastPage = page >= totalPages || totalPages === 0;

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
          {t("common.pagination.summary", {
            start,
            end,
            total,
          } as TranslationParams<"common.pagination.summary">)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <PaginationButton
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
          ariaLabel={t("common.pagination.firstPage")}
        >
          <ChevronsLeft className="h-4 w-4" />
        </PaginationButton>

        <PaginationButton
          onClick={() => onPageChange(page - 1)}
          disabled={isFirstPage}
          ariaLabel={t("common.pagination.previousPage")}
        >
          <ChevronLeft className="h-4 w-4" />
        </PaginationButton>

        {visiblePages.map((p, index) => {
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
            <PageButton
              key={pageNum}
              pageNum={pageNum}
              isActive={pageNum === page}
              onClick={() => onPageChange(pageNum)}
              ariaLabel={t("common.pagination.page", {
                page: pageNum,
              } as Record<string, string | number>)}
            />
          );
        })}

        <PaginationButton
          onClick={() => onPageChange(page + 1)}
          disabled={isLastPage}
          ariaLabel={t("common.pagination.nextPage")}
        >
          <ChevronRight className="h-4 w-4" />
        </PaginationButton>

        <PaginationButton
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage}
          ariaLabel={t("common.pagination.lastPage")}
        >
          <ChevronsRight className="h-4 w-4" />
        </PaginationButton>
      </div>
    </div>
  );
}
