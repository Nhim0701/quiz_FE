import { useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "@/i18n";
import { DIALOG_MODES } from "@/constants";
import { type Column } from "@/components/common/data-table";
import {
  createStringConverter,
  useAdminListData,
  useFilterHandlers,
  useFilterIdsConfig,
  useFilterParams,
  useFilterActions,
} from "@/hooks";
import { useAdminListActions } from "@/modules/admin/hooks";
import { AdminList } from "@/modules/admin/components";
import { useTestAssignmentsStore, type TestAssignment } from "../hooks";
import { TestAssignmentFormDialog } from "./form-dialog";
import { TestAssignmentsListSkeleton } from "./list-skeleton";
import type { ActiveFilter } from "@/components/common/filters";

interface TestAssignmentsListProps {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

export function TestAssignmentsList({ roles }: TestAssignmentsListProps) {
  const { t } = useTranslation();
  const { getFilter, setFilter } = useFilterParams();

  const searchValue = getFilter("userId") || "";

  const {
    assignments,
    loading,
    total: assignmentsTotal,
    fetchTestAssignments,
    deleteTestAssignment,
  } = useTestAssignmentsStore();

  const filterConfig = useMemo(
    () => [
      {
        filterKey: "userId",
        value: searchValue,
        defaultValue: "",
        converter: createStringConverter(),
      },
    ],
    [searchValue]
  );

  const fetchRef = useRef(fetchTestAssignments);
  useEffect(() => {
    fetchRef.current = fetchTestAssignments;
  }, [fetchTestAssignments]);

  const fetchWrapper = useCallback(
    async (page: number, pageSize: number, filters?: Record<string, string>) => {
      const result = await fetchRef.current(page, pageSize, filters);
      const state = useTestAssignmentsStore.getState();
      return {
        data: state.assignments,
        meta: { total: state.total },
      };
    },
    []
  );

  const {
    apiFilters,
    hasInitialFetch,
    handlePageChange,
    handlePageSizeChange,
    page,
    pageSize,
    total,
  } = useAdminListData({
    filterConfig,
    fetchFunction: fetchWrapper,
  });

  const filterHandlers = useMemo(
    () => [
      {
        filterId: "userId",
        resetValue: () => {
          setFilter("userId", null);
        },
      },
    ],
    [setFilter]
  );

  const activeFilters = useMemo<ActiveFilter[]>(() => [], []);

  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers({
    handlers: filterHandlers,
  });

  const filterIdsConfig = useFilterIdsConfig({
    handlers: filterHandlers,
    colorMap: { userId: "blue" },
  });

  const filterActionButtons = useFilterActions({
    onSearch: () => {},
    activeFilters,
    onClearFilters: handleClearAllFilters,
  });

  const paginationProps = useMemo(
    () => ({
      page,
      pageSize,
      total,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    }),
    [page, pageSize, total, handlePageChange, handlePageSizeChange]
  );

  const { actions } = useAdminListActions<TestAssignment>({
    roles: { ...roles, update: false },
    deleteFunction: async (id: string) => {
      await deleteTestAssignment(id);
      await fetchTestAssignments(page, pageSize, apiFilters);
    },
    refreshFunction: async (refreshPage: number, refreshPageSize: number) => {
      await fetchTestAssignments(refreshPage, refreshPageSize, apiFilters);
    },
    successMessageKey: "admin.testAssignments.deleteSuccess",
    deleteTitleKey: "admin.testAssignments.delete",
    confirmDeleteKey: "admin.testAssignments.confirmDelete",
    deleteButtonKey: "admin.testAssignments.delete",
    onClearFilters: handleClearAllFilters,
    getItemName: (a) => a.testName || a.testId,
    confirmDeleteParams: (a) => ({ name: a.testName || a.testId }),
  });

  const columns = useMemo<Column<TestAssignment>[]>(
    () => [
      {
        key: "id",
        header: t("admin.testAssignments.columns.id"),
        className: "w-[100px]",
        render: (a) => (
          <span className="truncate block max-w-[100px]" title={a.id}>
            {a.id}
          </span>
        ),
      },
      {
        key: "userId",
        header: t("admin.testAssignments.columns.user"),
        render: (a) => (
          <span className="font-medium">
            {a.userName ? `${a.userName}` : a.userId}
            {a.userEmail && (
              <span className="text-muted-foreground text-xs ml-1">
                ({a.userEmail})
              </span>
            )}
          </span>
        ),
      },
      {
        key: "testId",
        header: t("admin.testAssignments.columns.test"),
        render: (a) => (
          <span className="font-medium">{a.testName || a.testId}</span>
        ),
      },
      {
        key: "createdAt",
        header: t("admin.testAssignments.columns.createdAt"),
        render: (a) => (
          <span className="text-muted-foreground">
            {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}
          </span>
        ),
      },
    ],
    [t]
  );

  const handleRefresh = useCallback(async () => {
    await fetchTestAssignments(page, pageSize, apiFilters);
  }, [fetchTestAssignments, page, pageSize, apiFilters]);

  if (loading && assignments.length === 0 && !hasInitialFetch) {
    return <TestAssignmentsListSkeleton />;
  }

  return (
    <>
      <AdminList
        columns={columns}
        data={assignments}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.testAssignments.empty")}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        filterIdsConfig={filterIdsConfig}
        filterActionButtons={filterActionButtons}
        pagination={paginationProps}
        filterBarClassName="my-4"
      />
      <TestAssignmentFormDialog
        onClearFilters={handleClearAllFilters}
        onRefresh={handleRefresh}
      />
    </>
  );
}
