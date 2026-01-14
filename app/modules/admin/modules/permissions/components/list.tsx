import { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
  createArrayConverter,
  useSyncFilterToUrl,
  useApplyFilterFromUrl,
  FilterManager,
  createStringFilterHandler,
  createArrayFilterHandler,
  usePageData,
} from "@/hooks";
import { usePermissionsStore, type Permission } from "../hooks";
import { Edit, Trash2, Eye } from "lucide-react";
import { PermissionViewDialog } from "./permission-dialog";
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
  MultipleSelectCombobox,
  type ActiveFilter,
} from "@/components/common/filters";
import { useRolesStore } from "../../roles/hooks";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants";

interface PermissionsListProps {
  permissions: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  onClearFiltersReady?: (clearFilters: () => void) => void;
}

export function PermissionsList({
  permissions,
  onClearFiltersReady,
}: PermissionsListProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess, showDialog, closeDialog } = useApp();
  const { page, pageSize, total, setPage, setPageSize, setTotal } =
    usePaginationStore();

  // Search input state (for typing)
  const [searchInput, setSearchInput] = useState("");
  // Search value state (for filtering - only updates on Enter/button click)
  const [searchValue, setSearchValue] = useState("");
  // Role filter state
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Fetch roles for filter
  const { fetchRoles, roles } = useRolesStore();

  usePageData(() => fetchRoles(1, MAX_PAGE_SIZE_FOR_ALL), {
    errorKey: "errors.fetchRolesFailed",
    showLoading: false, // Don't show global loading for filter data
    showError: false, // Handle error silently for filter data
  });

  // Create role map for efficient lookup
  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    roles.forEach((role) => {
      map.set(role.id, role.name);
    });
    return map;
  }, [roles]);

  // Track if filters are being applied from URL to skip initial fetch
  const isApplyingFiltersFromUrl = useRef(false);
  const hasInitialFetch = useRef(false);
  const {
    permissions: permissionsList,
    loading,
    fetchPermissions,
    openDialog,
    openViewDialog,
    deletePermission,
    refreshPermissions,
    viewingPermission,
  } = usePermissionsStore();

  const filterHandlers = useMemo(
    () => [
      {
        filterId: "name",
        resetValue: () => {
          setSearchInput("");
          setSearchValue("");
        },
      },
      {
        filterId: "roleId",
        resetValue: () => {
          setSelectedRoleIds([]);
        },
      },
    ],
    []
  );

  const filterConfig = useMemo(
    () => [
      {
        filterKey: "name",
        value: searchValue,
        defaultValue: "",
        converter: createStringConverter(),
      },
      {
        filterKey: "roleId",
        value: selectedRoleIds,
        defaultValue: [],
        converter: createArrayConverter([]),
      },
    ],
    [searchValue, selectedRoleIds]
  );

  const { hasFilterParams } = useApplyFilterFromUrl({
    filterHandlers: {
      name: createStringFilterHandler(setSearchValue),
      roleId: createArrayFilterHandler(setSelectedRoleIds),
    },
    onFilterApplied: async () => {
      isApplyingFiltersFromUrl.current = true;
      hasInitialFetch.current = true;
      setPage(1);

      // Also set search input from URL
      const urlFilters = FilterManager.extractFiltersFromUrl(searchParams);
      const nameFilter = urlFilters.find((f) => f.key === "name");
      if (nameFilter) {
        setSearchInput(nameFilter.value);
      }

      try {
        const apiFilters = FilterManager.convertFiltersToApiParams(urlFilters);
        const result = await fetchPermissions(1, pageSize, apiFilters);
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
    hookId: "permissions",
  });

  useSyncFilterToUrl({
    filters: filterConfig,
    hookId: "permissions",
  });

  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers({
    handlers: filterHandlers,
    onFilterChange: () => {
      // Reset to first page when filter changes
      setPage(1);
    },
  });

  // Handler to remove a specific role from the array
  const handleRemoveRole = useCallback((roleId: string) => {
    setSelectedRoleIds((prev) => prev.filter((id) => id !== roleId));
    setPage(1);
  }, []);

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
        label: t("admin.permissions.columns.name"),
        value: searchValue,
      });
    }
    // Create separate filter for each selected role
    selectedRoleIds.forEach((roleId) => {
      const roleName = roleMap.get(roleId) || roleId;
      filters.push({
        id: `roleId_${roleId}`,
        label: t("admin.permissions.columns.role"),
        value: roleName,
      });
    });
    return filters;
  }, [searchValue, selectedRoleIds, roleMap, t]);

  // Custom handler for removing filters that handles array items
  const handleRemoveActiveFilter = useCallback(
    (filterId: string) => {
      // Check if it's a role filter (format: roleId_<id>)
      if (filterId.startsWith("roleId_")) {
        const roleId = filterId.replace("roleId_", "");
        handleRemoveRole(roleId);
      } else {
        // Use default handler for other filters
        handleRemoveFilter(filterId);
      }
    },
    [handleRemoveFilter, handleRemoveRole]
  );

  const filterIdsConfig = useFilterIdsConfig({
    handlers: filterHandlers,
    colorMap: {
      name: "blue",
      roleId: "green",
    },
  });

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        value: role.id,
        label: role.name,
      })),
    [roles]
  );

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
    filterConfig.forEach((filter: any) => {
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

    const loadPermissions = async () => {
      try {
        const result = await fetchPermissions(page, pageSize, apiFilters);
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
        hasInitialFetch.current = true;
      }
    };

    loadPermissions();
  }, [
    page,
    pageSize,
    apiFilters,
    hasFilterParams,
    fetchPermissions,
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

  const handleEdit = (permission: Permission) => {
    openDialog(permission);
  };

  const handleView = (permission: Permission) => {
    openViewDialog(permission);
  };

  const handleDelete = (permission: Permission) => {
    const confirmDelete = async () => {
      try {
        await deletePermission(permission.id);
        showSuccess(t("admin.permissions.deleteSuccess"));
        // Clear filters and fetch all data after delete
        handleClearAllFilters();
        await refreshPermissions(1, pageSize);
        closeDialog();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      }
    };

    showDialog({
      title: t("admin.permissions.delete"),
      content: (
        <AlertDialogDescription>
          {(
            t as (
              key: string,
              params?: Record<string, string | number>
            ) => string
          )("admin.permissions.confirmDelete", { name: permission.name })}
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
            {t("admin.permissions.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      ),
    });
  };

  const columns: Column<Permission>[] = [
    {
      key: "id",
      header: t("admin.permissions.columns.id"),
      className: "w-[100px]",
      render: (permission) => (
        <span className="truncate block max-w-[100px]" title={permission.id}>
          {permission.id}
        </span>
      ),
    },
    {
      key: "name",
      header: t("admin.permissions.columns.name"),
      render: (permission) => (
        <span className="font-medium">{permission.name}</span>
      ),
    },
    {
      key: "permission",
      header: t("admin.permissions.columns.permission"),
      render: (permission) => (
        <span className="text-muted-foreground font-mono">
          {permission.permission || "-"}
        </span>
      ),
    },
    {
      key: "description",
      header: t("admin.permissions.columns.description"),
      render: (permission) => (
        <span className="text-muted-foreground">
          {permission.description || "-"}
        </span>
      ),
    },
    {
      key: "roleName",
      header: t("admin.permissions.columns.role"),
      render: (permission) => {
        const roleName =
          permission.roleName ||
          (permission.roleId ? roleMap.get(permission.roleId) : undefined);
        return <span className="text-muted-foreground">{roleName || "-"}</span>;
      },
    },
  ];

  const actions: Action<Permission>[] = [
    ...(permissions.read
      ? [
          {
            label: t("common.viewInfo"),
            onClick: handleView,
            icon: <Eye className="h-4 w-4" />,
            actionType: "viewInfo" as const,
          },
        ]
      : []),
    ...(permissions.update
      ? [
          {
            label: t("common.edit"),
            onClick: handleEdit,
            icon: <Edit className="h-4 w-4" />,
            actionType: "edit" as const,
          },
        ]
      : []),
    ...(permissions.delete
      ? [
          {
            label: t("admin.permissions.delete"),
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
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            placeholderKey="admin.permissions.searchPlaceholder"
            className="flex-1 min-w-[200px]"
            searchKey="name"
          />
          <MultipleSelectCombobox
            options={roleOptions}
            selectedValues={selectedRoleIds}
            onSelect={(values) => {
              setSelectedRoleIds(values);
              setPage(1);
            }}
            placeholder={t("admin.permissions.filters.rolePlaceholder")}
            searchPlaceholder={t("admin.permissions.filters.roleSearch")}
            emptyMessage={t("admin.permissions.filters.roleEmpty")}
            className="w-full sm:w-[250px]"
            filterColor="green"
          />
          <FilterActions buttons={filterActionButtons} />
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4">
          <ActiveFilters
            filters={activeFilters}
            onRemove={handleRemoveActiveFilter}
            filterIdsConfig={filterIdsConfig}
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={permissionsList}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.permissions.empty")}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      <PermissionViewDialog
        permission={viewingPermission}
        onDelete={handleDelete}
      />
    </>
  );
}
