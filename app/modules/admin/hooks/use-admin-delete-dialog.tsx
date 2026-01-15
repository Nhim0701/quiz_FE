import { useCallback } from "react";
import { useTranslation, type TranslationKey } from "@/i18n";
import { useApp } from "@/hooks";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export interface UseAdminDeleteDialogConfig<T> {
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
}

export function useAdminDeleteDialog<T extends { id: string }>({
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
}: UseAdminDeleteDialogConfig<T>) {
  const { t } = useTranslation();
  const { showError, showSuccess, showDialog, closeDialog } = useApp();

  const handleDelete = useCallback(
    (item: T) => {
      const confirmDelete = async () => {
        try {
          await deleteFunction(item.id);
          showSuccess(t(successMessageKey as TranslationKey, undefined));
          if (onClearFilters) {
            onClearFilters();
          }
          await refreshFunction(1, pageSize);
          closeDialog();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : t("errors.genericError");
          showError(errorMessage);
        }
      };

      const itemName = getItemName ? getItemName(item) : "";
      const params = confirmDeleteParams
        ? confirmDeleteParams(item)
        : { name: itemName };

      showDialog({
        title: t(deleteTitleKey as TranslationKey, undefined),
        content: (
          <AlertDialogDescription>
            {t(confirmDeleteKey as TranslationKey, params as any)}
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
              {t(deleteButtonKey as TranslationKey, undefined)}
            </AlertDialogAction>
          </AlertDialogFooter>
        ),
      });
    },
    [
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
      showError,
      showSuccess,
      showDialog,
      closeDialog,
      t,
    ]
  );

  return { handleDelete };
}
