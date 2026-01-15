import { useMemo, useCallback } from "react";
import { useTranslation, type TranslationKey } from "@/i18n";
import { useApp } from "@/hooks";
import { useAdminDeleteDialog } from "./use-admin-delete-dialog";
import { Eye, Edit, Trash2 } from "lucide-react";
import type { Action } from "@/components/common/data-table";

export interface UseAdminActionsConfig<T extends { id: string }> {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  deleteConfig?: {
    deleteFunction: (id: string) => Promise<void>;
    refreshFunction: (page: number, pageSize: number) => Promise<void>;
    successMessageKey: string;
    deleteTitleKey: string;
    confirmDeleteKey: string;
    deleteButtonKey: string;
    pageSize: number;
    onClearFilters?: () => void;
    getItemName?: (item: T) => string;
    confirmDeleteParams?: (item: T) => Record<string, string | number>;
  };
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onDelete?: (item: T) => void;
  customActions?: Array<{
    label: string;
    onClick: (item: T) => void;
    icon?: React.ReactNode;
    variant?: "default" | "destructive";
    actionType?: "default" | "delete" | "edit" | "viewInfo";
    className?: string;
  }>;
  translationPrefix: string;
}

export function useAdminActions<T extends { id: string }>({
  roles,
  deleteConfig,
  onEdit,
  onView,
  onDelete,
  customActions = [],
  translationPrefix,
}: UseAdminActionsConfig<T>) {
  const { t } = useTranslation();

  const deleteHandler = deleteConfig
    ? useAdminDeleteDialog<T>(deleteConfig)
    : undefined;

  const handleDelete = useCallback(
    (item: T) => {
      if (onDelete) {
        onDelete(item);
      } else if (deleteHandler) {
        deleteHandler.handleDelete(item);
      }
    },
    [onDelete, deleteHandler]
  );

  const actions = useMemo<Action<T>[]>(() => {
    const baseActions: Action<T>[] = [];

    if (roles.read && onView) {
      baseActions.push({
        label: t("common.viewInfo"),
        onClick: onView,
        icon: <Eye className="h-4 w-4" />,
        actionType: "viewInfo" as const,
      });
    }

    if (roles.update && onEdit) {
      baseActions.push({
        label: t("common.edit"),
        onClick: onEdit,
        icon: <Edit className="h-4 w-4" />,
        actionType: "edit" as const,
      });
    }

    if (roles.delete && (onDelete || deleteHandler)) {
      baseActions.push({
        label: t(`${translationPrefix}.delete` as TranslationKey),
        onClick: handleDelete,
        variant: "destructive" as const,
        icon: <Trash2 className="h-4 w-4" />,
        actionType: "delete" as const,
      });
    }

    if (customActions.length > 0) {
      baseActions.push(...customActions);
    }

    return baseActions;
  }, [
    roles,
    onView,
    onEdit,
    handleDelete,
    customActions,
    t,
    translationPrefix,
    deleteHandler,
  ]);

  return {
    actions,
    handleDelete,
  };
}
