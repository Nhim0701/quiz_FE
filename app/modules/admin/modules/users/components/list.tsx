import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/i18n";
import { DataTable, Pagination } from "@/components/common/data-table";
import { usePaginationStore, useApp } from "@/hooks";
import { useUsersStore, useUsersFilters, type User } from "../hooks";
import { ChangePasswordDialog } from "./change-password-dialog";
import { AssignRolesDialog } from "./assign-roles-dialog";
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
  const { page, pageSize, total, setPage, setPageSize, setTotal } =
    usePaginationStore();

  const { users, loading, fetchUsers, openDialog, deleteUser, refreshUsers } =
    useUsersStore();

  const [changePasswordUser, setChangePasswordUser] = useState<User | null>(
    null
  );
  const [assignRolesUser, setAssignRolesUser] = useState<User | null>(null);

  const {
    searchInput,
    setSearchInput,
    activeFilters,
    filterActionButtons,
    filterIdsConfig,
    handleRemoveFilter,
    handleSearch,
    apiFilters,
    hasFilterParams,
    isApplyingFiltersFromUrl,
    hasInitialFetch,
  } = useUsersFilters(onClearFiltersReady);

  // Fetch users when filters or pagination changes
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
        const totalCount = result?.meta?.total ?? result?.data?.length ?? 0;
        setTotal(totalCount);
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

    loadUsers();
  }, [
    page,
    pageSize,
    apiFilters,
    hasFilterParams,
    fetchUsers,
    setTotal,
    showError,
    t,
    isApplyingFiltersFromUrl,
    hasInitialFetch,
  ]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
    },
    [setPageSize]
  );

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
      refreshUsers,
      pageSize,
      t,
    ]
  );

  const { columns, actions } = useUsersColumns({
    roles,
    onEdit: handleEdit,
    onView: handleView,
    onDelete: handleDelete,
    onChangePassword: handleChangePassword,
    onAssignRoles: handleAssignRoles,
  });

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
