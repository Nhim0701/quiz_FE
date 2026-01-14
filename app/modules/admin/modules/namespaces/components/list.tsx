import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router";
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
  useSyncFilterToUrl,
  useApplyFilterFromUrl,
  FilterManager,
} from "@/hooks";
import { useNamespacesStore, type Namespace } from "../hooks";
import { Edit, Trash2, Eye } from "lucide-react";
import { NamespaceFormDialog } from "./form-dialog";
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
  const [searchParams] = useSearchParams();
  const { showError, showSuccess, showDialog, closeDialog } = useApp();
  const { page, pageSize, total, setPage, setPageSize, setTotal } =
    usePaginationStore();

  // Search input state (for typing)
  const [searchInput, setSearchInput] = useState("");
  // Search value state (for filtering - only updates on Enter/button click)
  const [searchValue, setSearchValue] = useState("");

  // Track if filters are being applied from URL to skip initial fetch
  const isApplyingFiltersFromUrl = useRef(false);
  const hasInitialFetch = useRef(false);
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

  const { hasFilterParams } = useApplyFilterFromUrl({
    filterHandlers: {
      name: (_, value) => {
        setSearchInput(value);
        setSearchValue(value);
      },
    },
    onFilterApplied: async () => {
      isApplyingFiltersFromUrl.current = true;
      hasInitialFetch.current = true;
      setPage(1);

      try {
        const urlFilters = FilterManager.extractFiltersFromUrl(searchParams);
        const apiFilters = FilterManager.convertFiltersToApiParams(urlFilters);
        const result = await fetchNamespaces(1, pageSize, apiFilters);
        const totalCount = result?.meta?.total ?? result?.data?.length ?? 0;
        setTotal(totalCount);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.fetchDashboardFailed");
        showError(errorMessage);
      } finally {
        isApplyingFiltersFromUrl.current = false;
      }
    },
    hookId: "namespaces",
  });

  useSyncFilterToUrl({
    filters: filterConfig,
    hookId: "namespaces",
  });

  const handleFilterChange = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers({
    handlers: filterHandlers,
    onFilterChange: handleFilterChange,
  });

  // Expose clearFilters function to parent component (only once on mount)
  useEffect(() => {
    if (onClearFiltersReady) {
      onClearFiltersReady(handleClearAllFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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

  const apiFilters = useMemo(
    () =>
      searchValue
        ? FilterManager.convertFiltersToApiParams([
            { key: "name", value: searchValue },
          ])
        : {},
    [searchValue]
  );

  useEffect(() => {
    // Skip initial fetch if filters are being applied from URL
    if (
      (hasFilterParams && !hasInitialFetch.current) ||
      isApplyingFiltersFromUrl.current
    ) {
      return;
    }

    const loadNamespaces = async () => {
      try {
        const result = await fetchNamespaces(page, pageSize, apiFilters);
        const totalCount = result?.meta?.total ?? result?.data?.length ?? 0;
        setTotal(totalCount);
      } catch (error) {
        showError(
          error instanceof Error
            ? error.message
            : t("errors.fetchDashboardFailed")
        );
      } finally {
        hasInitialFetch.current = true;
      }
    };

    loadNamespaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, apiFilters]);

  const handlePageChange = useCallback(
    (newPage: number) => setPage(newPage),
    [setPage]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => setPageSize(newPageSize),
    [setPageSize]
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
