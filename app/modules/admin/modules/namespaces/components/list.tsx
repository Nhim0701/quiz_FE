import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { type Column } from "@/components/common/data-table";
import {
  usePaginationStore,
  useFilterActions,
  useFilterHandlers,
  useFilterIdsConfig,
  createStringConverter,
  createStringFilterHandler,
  useAdminListData,
} from "@/hooks";
import { useAdminListActions } from "@/modules/admin/hooks";
import { AdminList } from "@/modules/admin/components";
import { useNamespacesStore, type Namespace } from "../hooks";
import { NamespaceFormDialog } from "./form-dialog";
import { NamespacesListSkeleton } from "./list-skeleton";
import { DIALOG_MODES } from "@/constants";
import { type ActiveFilter } from "@/components/common/filters";

interface NamespacesListProps {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

export function NamespacesList({ roles }: NamespacesListProps) {
  const { t } = useTranslation();
  const { page, pageSize, total, setPage, setTotal } = usePaginationStore();

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const { namespaces, loading, fetchNamespaces, deleteNamespace, openDialog } =
    useNamespacesStore();

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

  const fetchNamespacesRef = useRef(fetchNamespaces);
  useEffect(() => {
    fetchNamespacesRef.current = fetchNamespaces;
  }, [fetchNamespaces]);

  const fetchNamespacesWrapper = useCallback(
    async (
      page: number,
      pageSize: number,
      filters?: Record<string, string>
    ) => {
      const result = await fetchNamespacesRef.current(page, pageSize, filters);
      const state = useNamespacesStore.getState();
      return {
        data: state.namespaces,
        meta: result?.meta || { total: 0 },
      };
    },
    []
  );

  const {
    apiFilters,
    hasInitialFetch,
    handlePageChange,
    handlePageSizeChange,
  } = useAdminListData({
    hookId: "namespaces",
    filterConfig,
    filterHandlers: {
      name: createStringFilterHandler((value) => {
        setSearchValue(value);
      }),
    },
    fetchFunction: fetchNamespacesWrapper,
    onFilterAppliedFromUrl: setSearchInput,
  });

  const filterHandlers = useMemo(
    () => [
      {
        filterId: "name",
        resetValue: () => {
          setSearchInput("");
          setSearchValue("");
        },
      },
    ],
    []
  );

  const handleFilterChange = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers({
    handlers: filterHandlers,
    onFilterChange: handleFilterChange,
  });

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

  const filterIdsConfig = useFilterIdsConfig({
    handlers: filterHandlers,
    colorMap: {
      name: "blue",
    },
  });

  const handleSearch = useCallback(() => {
    setSearchValue(searchInput);
    setPage(1);
  }, [searchInput, setPage]);

  const filterActionButtons = useFilterActions({
    onSearch: handleSearch,
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

  const handleViewInfo = useCallback(
    (namespace: Namespace) => openDialog(DIALOG_MODES.VIEW, namespace),
    [openDialog]
  );

  const { actions: baseActions } = useAdminListActions<Namespace>({
    roles,
    deleteFunction: async (id: string) => {
      await deleteNamespace(id);
      await fetchNamespaces(page, pageSize, apiFilters);
    },
    refreshFunction: async (refreshPage: number, refreshPageSize: number) => {
      await fetchNamespaces(refreshPage, refreshPageSize, apiFilters);
    },
    successMessageKey: "admin.namespaces.deleteSuccess",
    deleteTitleKey: "admin.namespaces.delete",
    confirmDeleteKey: "admin.namespaces.confirmDelete",
    deleteButtonKey: "admin.namespaces.delete",
    onClearFilters: handleClearAllFilters,
    onView: handleViewInfo,
    onEdit: (namespace: Namespace) => openDialog(DIALOG_MODES.EDIT, namespace),
    getItemName: (namespace) => namespace.name,
    confirmDeleteParams: (namespace) => ({ name: namespace.name }),
  });

  const actions = useMemo(() => baseActions, [baseActions]);

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
    await fetchNamespaces(page, pageSize, apiFilters);
  }, [fetchNamespaces, page, pageSize, apiFilters]);

  if (loading && namespaces.length === 0 && !hasInitialFetch.current) {
    return <NamespacesListSkeleton />;
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
          placeholderKey: "common.searchPlaceholder",
          className: "flex-1 min-w-[200px]",
          searchKey: "name",
        }}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        filterIdsConfig={filterIdsConfig}
        filterActionButtons={filterActionButtons}
        pagination={paginationProps}
        filterBarClassName="my-4"
      />
      <NamespaceFormDialog
        onClearFilters={handleClearAllFilters}
        onRefresh={handleRefresh}
      />
    </>
  );
}
