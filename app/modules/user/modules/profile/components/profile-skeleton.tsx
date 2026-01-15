import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Header Skeleton */}
            <div className="flex items-start gap-4">
              <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-6" />

            {/* About Section Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 flex-shrink-0" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>

            {/* User Details Section Skeleton */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-6" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Skeleton className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Professional Info Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
