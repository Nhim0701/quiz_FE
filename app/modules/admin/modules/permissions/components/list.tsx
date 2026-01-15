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
  createArrayConverter,
  createStringFilterHandler,
  createArrayFilterHandler,
  useAdminListData,
  usePageData,
} from "@/hooks";
import { usePermissionsStore, type Permission } from "../hooks";
import { Edit, Trash2, Eye } from "lucide-react";
import { PermissionFormDialog } from "./form-dialog";
import { PermissionsListSkeleton } from "./list-skeleton";
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
  const { showError, showSuccess, showDialog, closeDialog } = useApp();
  const { page, pageSize, total, setPage } = usePaginationStore();

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const { fetchRoles, roles } = useRolesStore();

  usePageData(() => fetchRoles(1, MAX_PAGE_SIZE_FOR_ALL), {
    errorKey: "errors.fetchRolesFailed",
    showLoading: false,
    showError: false,
  });

  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    roles.forEach((role) => {
      map.set(role.id, role.name);
    });
    return map;
  }, [roles]);

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

  const {
    apiFilters,
    hasInitialFetch,
    handlePageChange,
    handlePageSizeChange,
  } = useAdminListData({
    hookId: "permissions",
    filterConfig,
    filterHandlers: {
      name: createStringFilterHandler((value) => {
        setSearchValue(value);
      }),
      roleId: createArrayFilterHandler(setSelectedRoleIds),
    },
    fetchFunction: fetchPermissions,
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
      {
        filterId: "roleId",
        resetValue: () => {
          setSelectedRoleIds([]);
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

  useEffect(() => {
    if (onClearFiltersReady) {
      onClearFiltersReady(handleClearAllFilters);
    }
  }, [onClearFiltersReady, handleClearAllFilters]);

  const handleRemoveRole = useCallback(
    (roleId: string) => {
      setSelectedRoleIds((prev) => prev.filter((id) => id !== roleId));
      setPage(1);
    },
    [setPage]
  );

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (searchValue) {
      filters.push({
        id: "name",
        label: t("admin.permissions.columns.name"),
        value: searchValue,
      });
    }
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

  const handleRemoveActiveFilter = useCallback(
    (filterId: string) => {
      if (filterId.startsWith("roleId_")) {
        const roleId = filterId.replace("roleId_", "");
        handleRemoveRole(roleId);
      } else {
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
    (permission: Permission) => openDialog(permission),
    [openDialog]
  );

  const handleView = useCallback(
    (permission: Permission) => openViewDialog(permission),
    [openViewDialog]
  );

  const handleDelete = useCallback(
    (permission: Permission) => {
      const confirmDelete = async () => {
        try {
          await deletePermission(permission.id);
          showSuccess(t("admin.permissions.deleteSuccess"));
          handleClearAllFilters();
          await refreshPermissions(1, pageSize);
          closeDialog();
        } catch (error) {
          showError(
            error instanceof Error ? error.message : t("errors.genericError")
          );
        }
      };

      showDialog({
        title: t("admin.permissions.delete"),
        content: (
          <AlertDialogDescription>
            {t("admin.permissions.confirmDelete", {
              name: permission.name,
            } as TranslationParams<"admin.permissions.confirmDelete">)}
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
    },
    [
      deletePermission,
      showSuccess,
      t,
      handleClearAllFilters,
      refreshPermissions,
      pageSize,
      closeDialog,
      showDialog,
      showError,
    ]
  );

  const columns = useMemo<Column<Permission>[]>(
    () => [
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
          return (
            <span className="text-muted-foreground">{roleName || "-"}</span>
          );
        },
      },
    ],
    [t, roleMap]
  );

  const actions = useMemo<Action<Permission>[]>(
    () => [
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
    ],
    [permissions, t, handleView, handleEdit, handleDelete]
  );

  // Show skeleton on initial load
  if (loading && permissionsList.length === 0 && !hasInitialFetch.current) {
    return (
      <>
        <PermissionsListSkeleton />
        <PermissionFormDialog onDelete={handleDelete} />
      </>
    );
  }

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
        pagination={paginationProps}
      />
      <PermissionFormDialog onDelete={handleDelete} />
    </>
  );
}
