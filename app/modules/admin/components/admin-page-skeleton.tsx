import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

interface AdminPageSkeletonProps {
  /**
   * Có hiển thị create button không (mặc định: true)
   */
  showCreateButton?: boolean;
  /**
   * Có hiển thị list skeleton không (mặc định: true)
   */
  showList?: boolean;
}

/**
 * Skeleton component cho admin page wrapper
 * Sử dụng cho các trang chính trong admin modules
 */
export function AdminPageSkeleton({
  showCreateButton = true,
  showList = true,
}: AdminPageSkeletonProps) {
  return (
    <Container className="p-2">
      {/* Page Header Skeleton */}
      <div className="mb-4">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Card Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <Skeleton className="h-6 w-48" />
          {showCreateButton && <Skeleton className="h-9 w-32" />}
        </CardHeader>
        <CardContent>
          {showList && (
            <>
              {/* Filter Bar Skeleton */}
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <Skeleton className="h-10 flex-1 min-w-[200px]" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>

              {/* Table Skeleton */}
              <div className="border rounded-lg">
                {/* Table Header */}
                <div className="border-b border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-4 gap-4 p-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-5 w-24" />
                    ))}
                  </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="grid grid-cols-4 gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {Array.from({ length: 4 }).map((_, colIndex) => (
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
              </div>

              {/* Pagination Skeleton */}
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
