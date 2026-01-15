import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "@/i18n";
import { DataTable } from "@/components/common/data-table";
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
import { useUsersStore, type User } from "../hooks";
import { useRolesStore } from "@/modules/admin/modules/roles/hooks";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants";
import { ChangePasswordDialog } from "./change-password-dialog";
import { AssignRolesDialog } from "./assign-roles-dialog";
import { UsersListSkeleton } from "./list-skeleton";
import { DIALOG_MODES } from "@/constants";
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
import { useUsersColumns } from "./list-columns";

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
  const { showError, showSuccess, showDialog, closeDialog } = useApp();
  const { page, pageSize, total, setPage } = usePaginationStore();

  const { users, loading, fetchUsers, openDialog, deleteUser, refreshUsers } =
    useUsersStore();

  const { roles: rolesList, fetchRoles } = useRolesStore();

  const [changePasswordUser, setChangePasswordUser] = useState<User | null>(
    null
  );
  const [assignRolesUser, setAssignRolesUser] = useState<User | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  usePageData(() => fetchRoles(1, MAX_PAGE_SIZE_FOR_ALL), {
    errorKey: "errors.fetchRolesFailed",
    showLoading: false,
    showError: false,
  });

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
    hookId: "users",
    filterConfig,
    filterHandlers: {
      fullName: createStringFilterHandler((value) => {
        setSearchValue(value);
      }),
      roleId: createArrayFilterHandler(setSelectedRoleIds),
    },
    fetchFunction: fetchUsers,
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
      name: "blue",
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

  const handleEdit = useCallback(
    (user: User) => {
      openDialog(DIALOG_MODES.EDIT, user);
    },
    [openDialog]
  );

  const handleView = useCallback(
    (user: User) => {
      openDialog(DIALOG_MODES.VIEW, user);
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
    await refreshUsers(page, pageSize, apiFilters);
  }, [refreshUsers, page, pageSize, apiFilters]);

  const handleDelete = useCallback(
    (user: User) => {
      const confirmDelete = async () => {
        try {
          await deleteUser(user.id);
          showSuccess(t("admin.users.deleteSuccess"));
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
    },
    [
      deleteUser,
      showSuccess,
      showError,
      showDialog,
      closeDialog,
      handleClearAllFilters,
      refreshUsers,
      pageSize,
      t,
    ]
  );

  const { columns, actions } = useUsersColumns({
    roles,
    rolesList,
    onEdit: handleEdit,
    onView: handleView,
    onDelete: handleDelete,
    onChangePassword: handleChangePassword,
    onAssignRoles: handleAssignRoles,
  });

  // Show skeleton on initial load
  if (loading && users.length === 0 && !hasInitialFetch.current) {
    return (
      <>
        <UsersListSkeleton />
        <ChangePasswordDialog
          user={changePasswordUser}
          open={!!changePasswordUser}
          onOpenChange={(open) => !open && setChangePasswordUser(null)}
        />
        <AssignRolesDialog
          user={assignRolesUser}
          open={!!assignRolesUser}
          onOpenChange={(open) => !open && setAssignRolesUser(null)}
        />
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
            placeholderKey="admin.users.searchPlaceholder"
            className="flex-1 min-w-[200px]"
            searchKey="fullName"
          />
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
        data={users}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.users.empty")}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
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
