import { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation, type TranslationParams } from "@/i18n";
import {
  DataTable,
  type Column,
  type Action,
} from "@/components/common/data-table";
import {
  usePaginationStore,
  useApp,
  useFilterActions,
  useFilterHandlers,
  useFilterIdsConfig,
  createStringConverter,
  createStringFilterHandler,
  useAdminListData,
} from "@/hooks";
import { useNamespacesStore, type Namespace } from "../hooks";
import { Edit, Trash2, Eye } from "lucide-react";
import { NamespaceFormDialog } from "./form-dialog";
import { NamespacesListSkeleton } from "./list-skeleton";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  SearchInput,
  ActiveFilters,
  FilterActions,
  type ActiveFilter,
} from "@/components/common/filters";

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
  const { showError, showSuccess, showDialog, closeDialog } = useApp();
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
    viewingNamespace,
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
      },
    ],
    [resetSearchFilter]
  );

  const handleFilterChange = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers({
    handlers: filterHandlers,
    onFilterChange: handleFilterChange,
  });

  useEffect(() => {
    if (onClearFiltersReady) {
      onClearFiltersReady(handleClearAllFilters);
    }
  }, [onClearFiltersReady, handleClearAllFilters]);

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

  const handleEdit = useCallback(
    (namespace: Namespace) => openDialog(namespace),
    [openDialog]
  );

  const handleView = useCallback(
    (namespace: Namespace) => openViewDialog(namespace),
    [openViewDialog]
  );

  const handleDelete = useCallback(
    (namespace: Namespace) => {
      const confirmDelete = async () => {
        try {
          await deleteNamespace(namespace.id);
          showSuccess(t("admin.namespaces.deleteSuccess"));
          handleClearAllFilters();
          await refreshNamespaces(1, pageSize);
          closeDialog();
        } catch (error) {
          showError(
            error instanceof Error ? error.message : t("errors.genericError")
          );
        }
      };

      showDialog({
        title: t("admin.namespaces.delete"),
        content: (
          <AlertDialogDescription>
            {t("admin.namespaces.confirmDelete", {
              name: namespace.name,
            } as TranslationParams<"admin.namespaces.confirmDelete">)}
          </AlertDialogDescription>
        ),
        footer: (
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialog}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("admin.namespaces.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        ),
      });
    },
    [
      deleteNamespace,
      showSuccess,
      t,
      handleClearAllFilters,
      refreshNamespaces,
      pageSize,
      closeDialog,
      showDialog,
      showError,
    ]
  );

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

  const actions = useMemo<Action<Namespace>[]>(
    () => [
      ...(roles.read
        ? [
            {
              label: t("common.viewInfo"),
              onClick: handleView,
              icon: <Eye className="h-4 w-4" />,
              actionType: "viewInfo" as const,
            },
          ]
        : []),
      ...(roles.update
        ? [
            {
              label: t("common.edit"),
              onClick: handleEdit,
              icon: <Edit className="h-4 w-4" />,
              actionType: "edit" as const,
            },
          ]
        : []),
      ...(roles.delete
        ? [
            {
              label: t("admin.namespaces.delete"),
              onClick: handleDelete,
              variant: "destructive" as const,
              icon: <Trash2 className="h-4 w-4" />,
              actionType: "delete" as const,
            },
          ]
        : []),
    ],
    [roles, t, handleView, handleEdit, handleDelete]
  );

  // Show skeleton on initial load
  if (loading && namespaces.length === 0 && !hasInitialFetch.current) {
    return (
      <>
        <NamespacesListSkeleton />
        <NamespaceFormDialog onDelete={handleDelete} />
      </>
    );
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            placeholderKey="admin.namespaces.searchPlaceholder"
            className="flex-1"
            searchKey="name"
          />
          <FilterActions buttons={filterActionButtons} />
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4">
          <ActiveFilters
            filters={activeFilters}
            onRemove={handleRemoveFilter}
            filterIdsConfig={filterIdsConfig}
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={namespaces}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.namespaces.empty")}
        pagination={paginationProps}
      />
      <NamespaceFormDialog onDelete={handleDelete} />
    </>
  );
}
