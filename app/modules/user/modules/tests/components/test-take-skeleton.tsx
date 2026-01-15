import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TestTakeSkeleton() {
  return (
    <div className="py-6 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Header Skeleton */}
            <Card className="p-4 sm:p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="min-w-0 flex-1 pr-4">
                    <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 mb-2" />
                    <Skeleton className="h-4 w-full max-w-md mb-1" />
                    <Skeleton className="h-3 w-32 mt-1" />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <Skeleton className="h-8 sm:h-10 w-20 sm:w-24 rounded-md" />
                    <Skeleton className="h-8 sm:h-10 w-8 sm:w-10 rounded-md" />
                  </div>
                </div>
                {/* Progress Bar Skeleton */}
                <Skeleton className="w-full h-2 rounded-full" />
              </CardContent>
            </Card>

            {/* Question Skeleton */}
            <Card className="p-5 sm:p-8">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-5 sm:mb-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-5 sm:h-6 w-full mb-2" />
                  <Skeleton className="h-5 sm:h-6 w-4/5" />
                </div>
              </div>

              {/* Answer Options */}
              <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-full p-3 sm:p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 w-full">
                      <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex-shrink-0" />
                      <Skeleton className="h-4 sm:h-5 flex-1" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-2 sm:gap-3">
                  <Skeleton className="h-9 w-20 sm:w-24 rounded-md" />
                  <Skeleton className="h-9 w-20 sm:w-24 rounded-md" />
                </div>
                <Skeleton className="h-9 w-20 sm:w-24 rounded-md" />
              </div>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 lg:sticky lg:top-[88px] lg:z-40 lg:self-start">
            {/* Summary Card */}
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 sm:h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full mt-4 sm:mt-6 rounded-md" />
              </CardContent>
            </Card>

            {/* Question Navigator */}
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 sm:h-6 w-28" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <Skeleton key={idx} className="aspect-square rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
