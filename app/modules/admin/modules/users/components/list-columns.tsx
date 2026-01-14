import { useTranslation } from "@/i18n";
import type { Column, Action } from "@/components/common/data-table";
import type { User } from "../hooks";
import type { Role } from "@/modules/admin/modules/roles/hooks";
import { Edit, Trash2, Eye, Lock, Shield } from "lucide-react";

interface UseUsersColumnsProps {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  rolesList: Role[];
  onEdit: (user: User) => void;
  onView: (user: User) => void;
  onDelete: (user: User) => void;
  onChangePassword: (user: User) => void;
  onAssignRoles: (user: User) => void;
}

export function useUsersColumns({
  roles,
  rolesList,
  onEdit,
  onView,
  onDelete,
  onChangePassword,
  onAssignRoles,
}: UseUsersColumnsProps) {
  const { t } = useTranslation();

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
    {
      key: "role",
      header: t("admin.users.columns.role"),
      render: (user) => {
        const role = rolesList.find((r) => r.id === user.roleId);
        return (
          <span className="text-muted-foreground">
            {role?.name || "-"}
          </span>
        );
      },
    },
  ];

  const actions: Action<User>[] = [
    ...(roles.read
      ? [
          {
            label: t("common.viewInfo"),
            onClick: onView,
            icon: <Eye className="h-4 w-4" />,
            actionType: "viewInfo" as const,
          },
        ]
      : []),
    ...(roles.update
      ? [
          {
            label: t("common.edit"),
            onClick: onEdit,
            icon: <Edit className="h-4 w-4" />,
            actionType: "edit" as const,
          },
        ]
      : []),
    ...(roles.delete
      ? [
          {
            label: t("admin.users.delete"),
            onClick: onDelete,
            variant: "destructive" as const,
            icon: <Trash2 className="h-4 w-4" />,
            actionType: "delete" as const,
          },
        ]
      : []),
    ...(roles.update
      ? [
          {
            label: t("admin.users.changePassword.title"),
            onClick: onChangePassword,
            icon: <Lock className="h-4 w-4" />,
            className:
              "border-purple-500/50 text-purple-600 hover:bg-gradient-to-br hover:from-purple-500 hover:to-indigo-600 hover:text-white hover:border-purple-600 dark:border-purple-400/50 dark:text-purple-400 dark:hover:from-purple-600 dark:hover:to-indigo-700 dark:hover:border-purple-500",
            actionType: "default" as const,
          },
          {
            label: t("admin.users.assignRoles.title"),
            onClick: onAssignRoles,
            icon: <Shield className="h-4 w-4" />,
            className:
              "border-amber-500/50 text-amber-600 hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-600 hover:text-white hover:border-amber-600 dark:border-amber-400/50 dark:text-amber-400 dark:hover:from-amber-600 dark:hover:to-orange-700 dark:hover:border-amber-500",
            actionType: "default" as const,
          },
        ]
      : []),
  ];

  return { columns, actions };
}
