import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const DashboardSkeleton = () => {
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

      {/* SubmissionHistory Skeleton */}
      <Card className="overflow-hidden">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  {[48, 20, 32, 20].map((w, i) => (
                    <th key={i} className="px-4 sm:px-6 py-3">
                      <Skeleton className={`h-4 w-${w}`} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-4 sm:px-6 py-4 flex justify-end">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
