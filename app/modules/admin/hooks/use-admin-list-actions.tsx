import { useCallback, useMemo } from "react";
import { useTranslation, type TranslationKey } from "@/i18n";
import { usePaginationStore, useApp } from "@/hooks";
import { useAdminDeleteDialog } from "./use-admin-delete-dialog";
import type { Action } from "@/components/common/data-table";
import { Edit, Eye, Trash2 } from "lucide-react";

export interface UseAdminListActionsConfig<T extends { id: string }> {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  deleteFunction: (id: string) => Promise<void>;
  refreshFunction: (page: number, pageSize: number) => Promise<void>;
  successMessageKey: string;
  deleteTitleKey: string;
  confirmDeleteKey: string;
  deleteButtonKey: string;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onDelete?: (item: T) => void;
  onClearFilters?: () => void;
  getItemName?: (item: T) => string;
  confirmDeleteParams?: (item: T) => Record<string, string | number>;
  viewLabelKey?: string;
  editLabelKey?: string;
  deleteLabelKey?: string;
  viewIcon?: React.ReactNode;
  editIcon?: React.ReactNode;
  deleteIcon?: React.ReactNode;
}

export function useAdminListActions<T extends { id: string }>({
  roles,
  deleteFunction,
  refreshFunction,
  successMessageKey,
  deleteTitleKey,
  confirmDeleteKey,
  deleteButtonKey,
  onEdit,
  onView,
  onDelete,
  onClearFilters,
  getItemName,
  confirmDeleteParams,
  viewLabelKey = "common.viewInfo",
  editLabelKey = "common.edit",
  deleteLabelKey,
  viewIcon,
  editIcon,
  deleteIcon,
}: UseAdminListActionsConfig<T>) {
  const { t } = useTranslation();
  const { pageSize } = usePaginationStore();

  const { handleDelete: handleDeleteInternal } = useAdminDeleteDialog<T>({
    deleteFunction,
    refreshFunction,
    successMessageKey,
    deleteTitleKey,
    confirmDeleteKey,
    deleteButtonKey,
    pageSize,
    onClearFilters,
    getItemName,
    confirmDeleteParams,
  });

  const handleEdit = useCallback(
    (item: T) => {
      onEdit?.(item);
    },
    [onEdit]
  );

  const handleView = useCallback(
    (item: T) => {
      onView?.(item);
    },
    [onView]
  );

  const handleDelete = useCallback(
    (item: T) => {
      if (onDelete) {
        onDelete(item);
      } else {
        handleDeleteInternal(item);
      }
    },
    [onDelete, handleDeleteInternal]
  );

  const actions = useMemo<Action<T>[]>(() => {
    const result: Action<T>[] = [];

    if (roles.read && onView) {
      result.push({
        label: t(viewLabelKey as TranslationKey),
        onClick: handleView,
        icon: viewIcon ?? <Eye className="h-4 w-4" />,
        actionType: "viewInfo" as const,
      });
    }

    if (roles.update && onEdit) {
      result.push({
        label: t(editLabelKey as TranslationKey),
        onClick: handleEdit,
        icon: editIcon ?? <Edit className="h-4 w-4" />,
        actionType: "edit" as const,
      });
    }

    if (roles.delete) {
      result.push({
        label: t(
          (deleteLabelKey as TranslationKey) ||
            (deleteButtonKey as TranslationKey)
        ),
        onClick: handleDelete,
        variant: "destructive" as const,
        icon: deleteIcon ?? <Trash2 className="h-4 w-4" />,
        actionType: "delete" as const,
      });
    }

    return result;
  }, [
    roles,
    onView,
    onEdit,
    handleView,
    handleEdit,
    handleDelete,
    viewLabelKey,
    editLabelKey,
    deleteLabelKey,
    deleteButtonKey,
    viewIcon,
    editIcon,
    deleteIcon,
    t,
  ]);

  return {
    actions,
    handleEdit,
    handleView,
    handleDelete,
  };
}
