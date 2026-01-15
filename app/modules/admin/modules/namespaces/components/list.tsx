import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "@/i18n";
import { type Column } from "@/components/common/data-table";
import {
  usePaginationStore,
  createStringConverter,
  createStringFilterHandler,
  useAdminListData,
} from "@/hooks";
import {
  useAdminListFilters,
  useAdminListActions,
} from "@/modules/admin/hooks";
import { AdminList } from "@/modules/admin/components";
import { useNamespacesStore, type Namespace } from "../hooks";
import { NamespaceFormDialog } from "./form-dialog";
import { NamespacesListSkeleton } from "./list-skeleton";
import type { ActiveFilter } from "@/components/common/filters";

interface NamespacesListProps {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  onClearFiltersReady?: (clearFilters: () => void) => void;
}

export function NamespacesList({
  roles,
  onClearFiltersReady,
}: NamespacesListProps) {
  const { t } = useTranslation();
  const { page, pageSize, total, setPage } = usePaginationStore();

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const {
    namespaces,
    loading,
    fetchNamespaces,
    openDialog,
    openViewDialog,
    deleteNamespace,
    refreshNamespaces,
  } = useNamespacesStore();

  const filterConfig = useMemo(
    () => [
      {
        filterKey: "name",
        value: searchValue,
        defaultValue: "",
        converter: createStringConverter(),
      },
    ],
    [searchValue]
  );

  const { hasInitialFetch, handlePageChange, handlePageSizeChange } =
    useAdminListData({
      hookId: "namespaces",
      filterConfig,
      filterHandlers: {
        name: createStringFilterHandler((value) => {
          setSearchInput(value);
          setSearchValue(value);
        }),
      },
      fetchFunction: fetchNamespaces,
      onFilterAppliedFromUrl: setSearchInput,
    });

  const resetSearchFilter = useCallback(() => {
    setSearchInput("");
    setSearchValue("");
  }, []);

  const filterHandlers = useMemo(
    () => [
      {
        filterId: "name",
        resetValue: resetSearchFilter,
        color: "blue",
      },
    ],
    [resetSearchFilter]
  );

  const activeFilters = useMemo<ActiveFilter[]>(
    () =>
      searchValue
        ? [
            {
              id: "name",
              label: t("admin.namespaces.columns.name"),
              value: searchValue,
            },
          ]
        : [],
    [searchValue, t]
  );

  const {
    filterIdsConfig,
    filterActionButtons,
    handleRemoveFilter,
    handleClearAllFilters,
  } = useAdminListFilters({
    filterHandlers,
    activeFilters,
    onClearFiltersReady,
  });

  const handleSearch = useCallback(() => {
    setSearchValue(searchInput);
    setPage(1);
  }, [searchInput, setPage]);

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

  const handleEdit = useCallback(
    (namespace: Namespace) => openDialog(namespace),
    [openDialog]
  );

  const handleView = useCallback(
    (namespace: Namespace) => openViewDialog(namespace),
    [openViewDialog]
  );

  const refreshNamespacesList = useCallback(
    async (refreshPage: number, refreshPageSize: number) => {
      await refreshNamespaces(refreshPage, refreshPageSize);
    },
    [refreshNamespaces]
  );

  const { actions } = useAdminListActions<Namespace>({
    roles,
    deleteFunction: deleteNamespace,
    refreshFunction: refreshNamespacesList,
    successMessageKey: "admin.namespaces.deleteSuccess",
    deleteTitleKey: "admin.namespaces.delete",
    confirmDeleteKey: "admin.namespaces.confirmDelete",
    deleteButtonKey: "admin.namespaces.delete",
    onEdit: handleEdit,
    onView: handleView,
    onClearFilters: handleClearAllFilters,
    getItemName: (namespace) => namespace.name,
    confirmDeleteParams: (namespace) => ({ name: namespace.name }),
  });

  const columns = useMemo<Column<Namespace>[]>(
    () => [
      {
        key: "id",
        header: t("admin.namespaces.columns.id"),
        className: "w-[100px]",
        render: (namespace) => (
          <span className="truncate block max-w-[100px]" title={namespace.id}>
            {namespace.id}
          </span>
        ),
      },
      {
        key: "name",
        header: t("admin.namespaces.columns.name"),
        render: (namespace) => (
          <span className="font-medium">{namespace.name}</span>
        ),
      },
      {
        key: "prefix",
        header: t("admin.namespaces.columns.prefix"),
        render: (namespace) => (
          <span className="text-muted-foreground font-mono">
            {namespace.prefix || "-"}
          </span>
        ),
      },
      {
        key: "description",
        header: t("admin.namespaces.columns.description"),
        render: (namespace) => (
          <span className="text-muted-foreground">
            {namespace.description || "-"}
          </span>
        ),
      },
    ],
    [t]
  );

  const handleRefresh = useCallback(async () => {
    await refreshNamespaces(page, pageSize);
  }, [refreshNamespaces, page, pageSize]);

  // Show skeleton on initial load
  if (loading && namespaces.length === 0 && !hasInitialFetch.current) {
    return (
      <>
        <NamespacesListSkeleton />
      </>
    );
  }

  return (
    <>
      <AdminList
        columns={columns}
        data={namespaces}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.namespaces.empty")}
        searchInput={{
          value: searchInput,
          onChange: setSearchInput,
          onSearch: handleSearch,
          placeholderKey: "admin.namespaces.searchPlaceholder",
          className: "flex-1",
          searchKey: "name",
        }}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        filterIdsConfig={filterIdsConfig}
        filterActionButtons={filterActionButtons}
        pagination={paginationProps}
      />
      <NamespaceFormDialog onRefresh={handleRefresh} />
    </>
  );
}
