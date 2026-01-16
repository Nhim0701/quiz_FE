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
import { useRolesStore, type Role } from "../hooks";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { RoleFormDialog } from "./form-dialog";
import { RolesListSkeleton } from "./list-skeleton";
import { DIALOG_MODES } from "@/constants";
import { type ActiveFilter } from "@/components/common/filters";

interface RolesListProps {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

export function RolesList({ roles }: RolesListProps) {
  const { t } = useTranslation();
  const { page, pageSize, total, setPage, setTotal } = usePaginationStore();

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const {
    roles: rolesList,
    loading,
    fetchRoles,
    deleteRole,
    openDialog,
  } = useRolesStore();

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

  const fetchRolesRef = useRef(fetchRoles);
  useEffect(() => {
    fetchRolesRef.current = fetchRoles;
  }, [fetchRoles]);

  const fetchRolesWrapper = useCallback(
    async (
      page: number,
      pageSize: number,
      filters?: Record<string, string>
    ) => {
      const result = await fetchRolesRef.current(page, pageSize, filters);
      const state = useRolesStore.getState();
      return {
        data: state.roles,
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
    hookId: "roles",
    filterConfig,
    filterHandlers: {
      name: createStringFilterHandler((value) => {
        setSearchValue(value);
      }),
    },
    fetchFunction: fetchRolesWrapper,
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
              label: t("admin.roles.columns.name"),
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
    (role: Role) => openDialog(DIALOG_MODES.VIEW, role),
    [openDialog]
  );

  const { actions: baseActions } = useAdminListActions<Role>({
    roles,
    deleteFunction: async (id: string) => {
      await deleteRole(id);
      await fetchRoles(page, pageSize, apiFilters);
    },
    refreshFunction: async (refreshPage: number, refreshPageSize: number) => {
      await fetchRoles(refreshPage, refreshPageSize, apiFilters);
    },
    successMessageKey: "admin.roles.deleteSuccess",
    deleteTitleKey: "admin.roles.delete",
    confirmDeleteKey: "admin.roles.confirmDelete",
    deleteButtonKey: "admin.roles.delete",
    onClearFilters: handleClearAllFilters,
    onView: handleViewInfo,
    onEdit: (role: Role) => openDialog(DIALOG_MODES.EDIT, role),
  });

  const actions = useMemo(() => baseActions, [baseActions]);

  const columns = useMemo<Column<Role>[]>(
    () => [
      {
        key: "id",
        header: t("admin.roles.columns.id"),
        className: "w-[100px]",
        render: (role) => (
          <span className="truncate block max-w-[100px]" title={role.id}>
            {role.id}
          </span>
        ),
      },
      {
        key: "name",
        header: t("admin.roles.columns.name"),
        render: (role) => <span className="font-medium">{role.name}</span>,
      },
      {
        key: "description",
        header: t("admin.roles.columns.description"),
        render: (role) => (
          <span className="text-muted-foreground">
            {role.description || "-"}
          </span>
        ),
      },
      {
        key: "default",
        header: t("admin.roles.columns.default"),
        className: "w-[100px]",
        render: (role) => (
          <Badge variant={role.default ? "default" : "secondary"}>
            {role.default ? "Yes" : "No"}
          </Badge>
        ),
      },
      {
        key: "permissions",
        header: t("admin.roles.columns.permissions"),
        render: (role) => (
          <span className="text-muted-foreground">
            {role.permissions && role.permissions.length > 0
              ? `${role.permissions.length} ${t("admin.roles.columns.permissions")}`
              : "-"}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: t("admin.roles.columns.createdAt"),
        className: "w-[150px]",
        render: (role) => (
          <span className="text-muted-foreground text-sm">
            {role.createdAt
              ? format(new Date(role.createdAt), "dd/MM/yyyy HH:mm")
              : "-"}
          </span>
        ),
      },
      {
        key: "updatedAt",
        header: t("admin.roles.columns.updatedAt"),
        className: "w-[150px]",
        render: (role) => (
          <span className="text-muted-foreground text-sm">
            {role.updatedAt
              ? format(new Date(role.updatedAt), "dd/MM/yyyy HH:mm")
              : "-"}
          </span>
        ),
      },
    ],
    [t]
  );

  const handleRefresh = useCallback(async () => {
    await fetchRoles(page, pageSize, apiFilters);
  }, [fetchRoles, page, pageSize, apiFilters]);

  if (loading && rolesList.length === 0 && !hasInitialFetch.current) {
    return <RolesListSkeleton />;
  }

  return (
    <>
      <AdminList
        columns={columns}
        data={rolesList}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.roles.empty")}
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
      <RoleFormDialog
        onClearFilters={handleClearAllFilters}
        onRefresh={handleRefresh}
      />
    </>
  );
}
