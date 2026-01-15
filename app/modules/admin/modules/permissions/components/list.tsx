import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { type Column } from "@/components/common/data-table";
import {
  usePaginationStore,
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
import { useAdminListActions } from "@/modules/admin/hooks";
import { AdminList } from "@/modules/admin/components";
import { usePermissionsStore, type Permission } from "../hooks";
import { PermissionFormDialog } from "./form-dialog";
import { PermissionsListSkeleton } from "./list-skeleton";
import { DIALOG_MODES } from "@/constants";
import {
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
}

export function PermissionsList({ permissions }: PermissionsListProps) {
  const { t } = useTranslation();
  const { page, pageSize, total, setPage, setTotal } = usePaginationStore();

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const { fetchRoles, roles } = useRolesStore();

  usePageData(
    async () => {
      await fetchRoles(1, MAX_PAGE_SIZE_FOR_ALL);
    },
    {
      errorKey: "errors.fetchFilterDataFailed",
      showLoading: false,
      showError: false,
      onError: (error) => {
        console.error("Failed to fetch filter data:", error);
      },
    }
  );

  const {
    permissions: permissionsList,
    loading,
    fetchPermissions,
    deletePermission,
    openDialog,
  } = usePermissionsStore();

  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    roles.forEach((role) => {
      map.set(role.id, role.name);
    });
    return map;
  }, [roles]);

  const permissionsWithRoleNames = useMemo(() => {
    return permissionsList.map((permission) => ({
      ...permission,
      roleName:
        permission.roleName ||
        (permission.roleId ? roleMap.get(permission.roleId) : undefined) ||
        permission.roleId,
    }));
  }, [permissionsList, roleMap]);

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

  const fetchPermissionsRef = useRef(fetchPermissions);
  useEffect(() => {
    fetchPermissionsRef.current = fetchPermissions;
  }, [fetchPermissions]);

  const fetchPermissionsWrapper = useCallback(
    async (
      page: number,
      pageSize: number,
      filters?: Record<string, string>
    ) => {
      const result = await fetchPermissionsRef.current(page, pageSize, filters);
      const state = usePermissionsStore.getState();
      return {
        data: state.permissions,
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
    hookId: "permissions",
    filterConfig,
    filterHandlers: {
      name: createStringFilterHandler((value) => {
        setSearchValue(value);
      }),
      roleId: createArrayFilterHandler(setSelectedRoleIds),
    },
    fetchFunction: fetchPermissionsWrapper,
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

  const handleViewInfo = useCallback(
    (permission: Permission) => openDialog(DIALOG_MODES.VIEW, permission),
    [openDialog]
  );

  const { actions: baseActions } = useAdminListActions<Permission>({
    roles: permissions,
    deleteFunction: async (id: string) => {
      await deletePermission(id);
      await fetchPermissions(page, pageSize, apiFilters);
    },
    refreshFunction: async (refreshPage: number, refreshPageSize: number) => {
      await fetchPermissions(refreshPage, refreshPageSize, apiFilters);
    },
    successMessageKey: "admin.permissions.deleteSuccess",
    deleteTitleKey: "admin.permissions.delete",
    confirmDeleteKey: "admin.permissions.confirmDelete",
    deleteButtonKey: "admin.permissions.delete",
    onClearFilters: handleClearAllFilters,
    onView: handleViewInfo,
    onEdit: (permission: Permission) =>
      openDialog(DIALOG_MODES.EDIT, permission),
  });

  const actions = useMemo(() => baseActions, [baseActions]);

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
        render: (permission) => (
          <span className="text-muted-foreground">
            {permission.roleName || "-"}
          </span>
        ),
      },
    ],
    [t]
  );

  const handleRefresh = useCallback(async () => {
    await fetchPermissions(page, pageSize, apiFilters);
  }, [fetchPermissions, page, pageSize, apiFilters]);

  if (
    loading &&
    permissionsWithRoleNames.length === 0 &&
    !hasInitialFetch.current
  ) {
    return <PermissionsListSkeleton />;
  }

  const additionalFilters = (
    <>
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
    </>
  );

  return (
    <>
      <AdminList
        columns={columns}
        data={permissionsWithRoleNames}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.permissions.empty")}
        searchInput={{
          value: searchInput,
          onChange: setSearchInput,
          onSearch: handleSearch,
          placeholderKey: "admin.permissions.searchPlaceholder",
          className: "flex-1 min-w-[200px]",
          searchKey: "name",
        }}
        additionalFilters={additionalFilters}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveActiveFilter}
        filterIdsConfig={filterIdsConfig}
        filterActionButtons={filterActionButtons}
        pagination={paginationProps}
        filterBarClassName="my-4"
      />
      <PermissionFormDialog
        onClearFilters={handleClearAllFilters}
        onRefresh={handleRefresh}
      />
    </>
  );
}
