import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { useUsersStore, type User } from "../hooks";
import { useRolesStore } from "@/modules/admin/modules/roles/hooks";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants/app";
import { ChangePasswordDialog } from "./change-password-dialog";
import { AssignRolesDialog } from "./assign-roles-dialog";
import { UsersListSkeleton } from "./list-skeleton";
import {
  MultipleSelectCombobox,
  type ActiveFilter,
} from "@/components/common/filters";
import { Lock, Shield } from "lucide-react";
import { UserFormDialog } from "../components";
import { DIALOG_MODES } from "@/constants";

interface UsersListProps {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

export function UsersList({ roles }: UsersListProps) {
  const { t } = useTranslation();
  const { page, pageSize, total, setPage, setTotal } = usePaginationStore();

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const {
    users,
    loading,
    total: usersTotal,
    fetchUsers,
    deleteUser,
    openDialog,
  } = useUsersStore();
  const { roles: rolesList, fetchRoles } = useRolesStore();

  const [changePasswordUser, setChangePasswordUser] = useState<User | null>(
    null
  );
  const [assignRolesUser, setAssignRolesUser] = useState<User | null>(null);

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

  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    rolesList.forEach((role) => {
      map.set(role.id, role.name);
    });
    return map;
  }, [rolesList]);

  const roleOptions = useMemo(
    () =>
      rolesList.map((role) => ({
        value: role.id,
        label: role.name,
      })),
    [rolesList]
  );

  const filterHandlers = useMemo(
    () => [
      {
        filterId: "fullName",
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
        filterKey: "fullName",
        value: searchValue,
        defaultValue: "",
        converter: createStringConverter(),
      },
      {
        filterKey: "roleId",
        value: selectedRoleIds,
        defaultValue: [],
        converter: createArrayConverter(),
      },
    ],
    [searchValue, selectedRoleIds]
  );

  const fetchUsersRef = useRef(fetchUsers);
  useEffect(() => {
    fetchUsersRef.current = fetchUsers;
  }, [fetchUsers]);

  const fetchUsersWrapper = useCallback(
    async (
      page: number,
      pageSize: number,
      filters?: Record<string, string>
    ) => {
      await fetchUsersRef.current(page, pageSize, filters);
      const state = useUsersStore.getState();
      return {
        data: state.users,
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
  } = useAdminListData({
    hookId: "users",
    filterConfig,
    filterHandlers: {
      fullName: createStringFilterHandler((value) => {
        setSearchValue(value);
      }),
      roleId: createArrayFilterHandler(setSelectedRoleIds),
    },
    fetchFunction: fetchUsersWrapper,
    onFilterAppliedFromUrl: setSearchInput,
  });

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
        id: "fullName",
        label: t("admin.users.columns.fullName"),
        value: searchValue,
      });
    }
    selectedRoleIds.forEach((roleId) => {
      const roleName = roleMap.get(roleId) || roleId;
      filters.push({
        id: `roleId_${roleId}`,
        label: t("admin.users.columns.role"),
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
      fullName: "blue",
      roleId: "green",
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

  useEffect(() => {
    setTotal(usersTotal);
  }, [usersTotal, setTotal]);

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
    (user: User) => {
      openDialog(DIALOG_MODES.VIEW, user);
    },
    [openDialog]
  );

  const handleEdit = useCallback(
    (user: User) => {
      openDialog(DIALOG_MODES.EDIT, user);
    },
    [openDialog]
  );

  const handleChangePassword = useCallback((user: User) => {
    setChangePasswordUser(user);
  }, []);

  const handleAssignRoles = useCallback((user: User) => {
    setAssignRolesUser(user);
  }, []);

  const handleAssignRolesSuccess = useCallback(async () => {
    await fetchUsers(page, pageSize, apiFilters);
  }, [fetchUsers, page, pageSize, apiFilters]);

  const { actions: baseActions } = useAdminListActions<User>({
    roles,
    deleteFunction: async (id: string) => {
      await deleteUser(id);
      await fetchUsers(page, pageSize, apiFilters);
    },
    refreshFunction: async (refreshPage: number, refreshPageSize: number) => {
      await fetchUsers(refreshPage, refreshPageSize, apiFilters);
    },
    successMessageKey: "admin.users.deleteSuccess",
    deleteTitleKey: "admin.users.delete",
    confirmDeleteKey: "admin.users.confirmDelete",
    deleteButtonKey: "admin.users.delete",
    onClearFilters: handleClearAllFilters,
    onView: handleViewInfo,
    onEdit: handleEdit,
    confirmDeleteParams: (user) => ({ name: user.fullName }),
  });

  const actions = useMemo(() => {
    const customActions = [];
    if (roles.update) {
      customActions.push(
        {
          label: t("admin.users.changePassword.title"),
          onClick: handleChangePassword,
          icon: <Lock className="h-4 w-4" />,
          className:
            "border-purple-500/50 text-purple-600 hover:bg-gradient-to-br hover:from-purple-500 hover:to-indigo-600 hover:text-white hover:border-purple-600 dark:border-purple-400/50 dark:text-purple-400 dark:hover:from-purple-600 dark:hover:to-indigo-700 dark:hover:border-purple-500",
          actionType: "default" as const,
        },
        {
          label: t("admin.users.assignRoles.title"),
          onClick: handleAssignRoles,
          icon: <Shield className="h-4 w-4" />,
          className:
            "border-amber-500/50 text-amber-600 hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-600 hover:text-white hover:border-amber-600 dark:border-amber-400/50 dark:text-amber-400 dark:hover:from-amber-600 dark:hover:to-orange-700 dark:hover:border-amber-500",
          actionType: "default" as const,
        }
      );
    }
    return [...baseActions, ...customActions];
  }, [baseActions, roles.update, handleChangePassword, handleAssignRoles, t]);

  const columns = useMemo<Column<User>[]>(
    () => [
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
      {
        key: "role",
        header: t("admin.users.columns.role"),
        render: (user) => {
          const role = rolesList.find((r) => r.id === user.roleId);
          return (
            <span className="text-muted-foreground">{role?.name || "-"}</span>
          );
        },
      },
    ],
    [t, rolesList]
  );

  const handleRefresh = useCallback(async () => {
    await fetchUsers(page, pageSize, apiFilters);
  }, [fetchUsers, page, pageSize, apiFilters]);

  if (loading && users.length === 0 && !hasInitialFetch.current) {
    return <UsersListSkeleton />;
  }

  const additionalFilters = (
    <MultipleSelectCombobox
      options={roleOptions}
      selectedValues={selectedRoleIds}
      onSelect={(values) => {
        setSelectedRoleIds(values);
        setPage(1);
      }}
      placeholder={t("admin.users.filters.rolePlaceholder")}
      searchPlaceholder={t("admin.users.filters.roleSearch")}
      emptyMessage={t("admin.users.filters.roleEmpty")}
      className="w-full sm:w-[250px]"
      filterColor="green"
    />
  );

  return (
    <>
      <AdminList
        columns={columns}
        data={users}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.users.empty")}
        searchInput={{
          value: searchInput,
          onChange: setSearchInput,
          onSearch: handleSearch,
          placeholderKey: "common.searchPlaceholder",
          className: "flex-1 min-w-[200px]",
          searchKey: "fullName",
        }}
        additionalFilters={additionalFilters}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveActiveFilter}
        filterIdsConfig={filterIdsConfig}
        filterActionButtons={filterActionButtons}
        pagination={paginationProps}
        filterBarClassName="my-4"
      />
      <UserFormDialog
        onClearFilters={handleClearAllFilters}
        onRefresh={handleRefresh}
      />
      <ChangePasswordDialog
        user={changePasswordUser}
        open={!!changePasswordUser}
        onOpenChange={(open) => !open && setChangePasswordUser(null)}
      />
      <AssignRolesDialog
        user={assignRolesUser}
        open={!!assignRolesUser}
        onOpenChange={(open) => !open && setAssignRolesUser(null)}
        onSuccess={handleAssignRolesSuccess}
      />
    </>
  );
}
