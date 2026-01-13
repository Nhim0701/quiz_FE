import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "@/i18n";
import {
  DataTable,
  Pagination,
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
import { useUsersStore, type User } from "../hooks";
import { Edit, Trash2, Eye } from "lucide-react";
import { UserViewDialog } from "./user-dialog";
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

interface UsersListProps {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  onClearFiltersReady?: (clearFilters: () => void) => void;
}

export function UsersList({ roles, onClearFiltersReady }: UsersListProps) {
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
    users,
    loading,
    fetchUsers,
    openDialog,
    openViewDialog,
    deleteUser,
    refreshUsers,
    viewingUser,
  } = useUsersStore();

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

  const filterConfig = useMemo(
    () => [
      {
        filterKey: "fullName",
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
        const result = await fetchUsers(1, pageSize, apiFilters);
        if (result?.meta) {
          setTotal(result.meta.total || 0);
        } else if (result?.data) {
          setTotal(result.data.length);
        }
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
    hookId: "users",
  });

  useSyncFilterToUrl({
    filters: filterConfig,
    hookId: "users",
  });

  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers({
    handlers: filterHandlers,
    onFilterChange: () => {
      // Reset to first page when filter changes
      setPage(1);
    },
  });

  // Expose clearFilters function to parent component (only once on mount)
  const clearFiltersRef = useRef(handleClearAllFilters);
  clearFiltersRef.current = handleClearAllFilters;

  useEffect(() => {
    if (onClearFiltersReady) {
      onClearFiltersReady(() => clearFiltersRef.current());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (searchValue) {
      filters.push({
        id: "name",
        label: t("admin.users.columns.fullName"),
        value: searchValue,
      });
    }
    return filters;
  }, [searchValue, t]);

  const filterIdsConfig = useFilterIdsConfig({
    handlers: filterHandlers,
    colorMap: {
      name: "blue",
    },
  });

  const handleSearch = () => {
    setSearchValue(searchInput);
    setPage(1);
  };

  const filterActionButtons = useFilterActions({
    onSearch: handleSearch,
    activeFilters,
    onClearFilters: handleClearAllFilters,
  });

  const apiFilters = useMemo(() => {
    const activeFilters: Array<{ key: string; value: string }> = [];
    filterConfig.forEach((filter) => {
      const converted = filter.converter(filter.value);
      if (converted === null) return;

      let isActive = false;
      if (Array.isArray(converted)) {
        isActive = converted.length > 0;
      } else if (filter.defaultValue !== undefined) {
        const defaultConverted = filter.converter(filter.defaultValue);
        isActive = converted !== defaultConverted;
      } else {
        isActive = converted !== "";
      }

      if (isActive) {
        const filterValue = Array.isArray(converted)
          ? converted.join(",")
          : converted;
        activeFilters.push({
          key: filter.filterKey,
          value: filterValue,
        });
      }
    });
    return FilterManager.convertFiltersToApiParams(activeFilters);
  }, [filterConfig]);

  useEffect(() => {
    // Skip initial fetch if filters are being applied from URL
    if (
      (hasFilterParams && !hasInitialFetch.current) ||
      isApplyingFiltersFromUrl.current
    ) {
      return;
    }

    const loadUsers = async () => {
      try {
        const result = await fetchUsers(page, pageSize, apiFilters);
        if (result?.meta) {
          setTotal(result.meta.total || 0);
        } else if (result?.data) {
          setTotal(result.data.length);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.fetchDashboardFailed");
        showError(errorMessage);
      }
    };

    loadUsers();
    hasInitialFetch.current = true;
  }, [
    page,
    pageSize,
    apiFilters,
    hasFilterParams,
    fetchUsers,
    setTotal,
    showError,
    t,
  ]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const handleEdit = (user: User) => {
    openDialog(user);
  };

  const handleView = (user: User) => {
    openViewDialog(user);
  };

  const handleDelete = (user: User) => {
    const confirmDelete = async () => {
      try {
        await deleteUser(user.id);
        showSuccess(t("admin.users.deleteSuccess"));
        // Clear filters and fetch all data after delete
        handleClearAllFilters();
        await refreshUsers(1, pageSize);
        closeDialog();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      }
    };

    showDialog({
      title: t("admin.users.delete"),
      content: (
        <AlertDialogDescription>
          {(
            t as (
              key: string,
              params?: Record<string, string | number>
            ) => string
          )("admin.users.confirmDelete", { name: user.fullName })}
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
            {t("admin.users.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      ),
    });
  };

  const columns: Column<User>[] = [
    {
      key: "id",
      header: t("admin.users.columns.id"),
      className: "w-[100px]",
      render: (user) => (
        <span className="truncate block max-w-[100px]" title={user.id}>
          {user.id}
        </span>
      ),
    },
    {
      key: "fullName",
      header: t("admin.users.columns.fullName"),
      render: (user) => <span className="font-medium">{user.fullName}</span>,
    },
    {
      key: "email",
      header: t("admin.users.columns.email"),
      render: (user) => (
        <span className="text-muted-foreground">{user.email}</span>
      ),
    },
    {
      key: "phone",
      header: t("admin.users.columns.phone"),
      render: (user) => (
        <span className="text-muted-foreground">{user.phone || "-"}</span>
      ),
    },
  ];

  const actions: Action<User>[] = [
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
            label: t("admin.users.delete"),
            onClick: handleDelete,
            variant: "destructive" as const,
            icon: <Trash2 className="h-4 w-4" />,
            actionType: "delete" as const,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            placeholderKey="admin.users.searchPlaceholder"
            className="flex-1"
            searchKey="fullName"
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
        data={users}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.users.empty")}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      <UserViewDialog user={viewingUser} onDelete={handleDelete} />
    </>
  );
}
