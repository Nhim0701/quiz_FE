import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface AdminListSkeletonProps {
  /**
   * Số lượng cột trong bảng (mặc định: 4)
   */
  columnCount?: number;
  /**
   * Số lượng hàng trong bảng (mặc định: 5)
   */
  rowCount?: number;
  /**
   * Có hiển thị filter bar không (mặc định: true)
   */
  showFilters?: boolean;
  /**
   * Có hiển thị pagination không (mặc định: true)
   */
  showPagination?: boolean;
}

/**
 * Skeleton component cho admin list pages
 * Sử dụng cho các trang danh sách trong admin modules
 */
export function AdminListSkeleton({
  columnCount = 4,
  rowCount = 5,
  showFilters = true,
  showPagination = true,
}: AdminListSkeletonProps) {
  return (
    <>
      {/* Filter Bar Skeleton */}
      {showFilters && (
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Skeleton className="h-10 flex-1 min-w-[200px]" />
            <Skeleton className="h-10 w-[250px]" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      )}

      {/* Active Filters Skeleton */}
      {showFilters && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-32 rounded-full" />
            ))}
          </div>
        </div>
      )}

      {/* Table Skeleton */}
      <Card>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div
              className="grid gap-4 p-4"
              style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
            >
              {Array.from({ length: columnCount }).map((_, index) => (
                <Skeleton key={index} className="h-5 w-24" />
              ))}
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
              >
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className={`h-4 ${
                      colIndex === 0 ? "w-20" : colIndex === 1 ? "w-32" : "w-24"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination Skeleton */}
      {showPagination && (
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      )}
    </>
  );
}
