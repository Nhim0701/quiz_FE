import { AdminListSkeleton } from "@/modules/admin/components";

/**
 * Skeleton component cho QuestionsList
 */
export function QuestionsListSkeleton() {
  return <AdminListSkeleton columnCount={6} rowCount={5} showFilters={true} />;
}
