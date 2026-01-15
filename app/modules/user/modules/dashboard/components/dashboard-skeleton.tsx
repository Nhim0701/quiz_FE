import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-4 sm:p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mb-2" />
                  <Skeleton className="h-7 sm:h-9 w-16 sm:w-20" />
                </div>
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CategoryStats and TestStats Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* CategoryStats Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="w-full h-2 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* TestStats Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-1" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="w-full h-2 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RecentActivity Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
              >
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
