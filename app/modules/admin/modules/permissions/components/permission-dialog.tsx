import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/common/form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useApp, usePaginationStore } from "@/hooks";
import { permissionSchema, type PermissionFormData } from "../schemas";
import { usePermissionsStore, type Permission } from "../hooks";
import { Loader2, Edit, Trash2, Save, X } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";

interface PermissionViewDialogProps {
  permission: Permission | null;
  onDelete: (permission: Permission) => void;
}

export function PermissionViewDialog({
  permission,
  onDelete,
}: PermissionViewDialogProps) {
  const { t } = useTranslation();
  const {
    showError,
    showSuccess,
    showDialog,
    closeDialog: closeAppDialog,
  } = useApp();
  const { page, pageSize } = usePaginationStore();
  const {
    isDialogOpen,
    viewingPermission,
    isEditMode,
    closeDialog,
    updatePermission,
    refreshPermissions,
    loading,
    setEditMode,
  } = usePermissionsStore();

  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema(t)),
    defaultValues: {
      name: "",
      permission: "",
      description: "",
    },
  });

  useEffect(() => {
    if (viewingPermission) {
      reset({
        name: viewingPermission.name || "",
        permission: viewingPermission.permission || "",
        description: viewingPermission.description || "",
      });
    }
  }, [viewingPermission, reset, isDialogOpen]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (viewingPermission) {
      reset({
        name: viewingPermission.name || "",
        permission: viewingPermission.permission || "",
        description: viewingPermission.description || "",
      });
    }
  };

  const onSubmit = async (data: PermissionFormData) => {
    if (!viewingPermission) return;

    try {
      await updatePermission(viewingPermission.id, data);
      showSuccess(t("admin.permissions.updateSuccess"));
      setEditMode(false);
      await refreshPermissions(page, pageSize);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  const handleDeleteClick = () => {
    if (!viewingPermission) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(viewingPermission);
        closeAppDialog();
        closeDialog();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    };

    showDialog({
      title: t("admin.permissions.delete"),
      content: (
        <AlertDialogDescription>
          {(
            t as (
              key: string,
              params?: Record<string, string | number>
            ) => string
          )("admin.permissions.confirmDelete", {
            name: viewingPermission.name,
          })}
        </AlertDialogDescription>
      ),
      footer: (
        <AlertDialogFooterComponent>
          <AlertDialogCancel onClick={closeAppDialog}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("admin.permissions.delete")}
          </AlertDialogAction>
        </AlertDialogFooterComponent>
      ),
    });
  };

  if (!viewingPermission || !isDialogOpen) return null;

  const currentData = watch();
  const hasChanges =
    currentData.name !== viewingPermission.name ||
    currentData.permission !== viewingPermission.permission ||
    currentData.description !== (viewingPermission.description || "");

  return (
    <Dialog
      open={isDialogOpen && !!viewingPermission}
      onOpenChange={(open) => !open && closeDialog()}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("admin.permissions.viewTitle")}</DialogTitle>
          <DialogDescription>
            {t("admin.permissions.viewDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              id="name"
              label={t("admin.permissions.form.nameLabel")}
              type="text"
              placeholder={t("admin.permissions.form.namePlaceholder")}
              register={register("name")}
              error={errors.name}
              required
              disabled={!isEditMode || loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="permission"
              label={t("admin.permissions.form.permissionLabel")}
              type="text"
              placeholder={t("admin.permissions.form.permissionPlaceholder")}
              register={register("permission")}
              error={errors.permission}
              required
              disabled={!isEditMode || loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="description"
              label={t("admin.permissions.form.descriptionLabel")}
              type="text"
              placeholder={t("admin.permissions.form.descriptionPlaceholder")}
              register={register("description")}
              error={errors.description}
              disabled={!isEditMode || loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
          </div>
          <DialogFooter>
            {!isEditMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium border-0"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t("common.edit")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteClick}
                  disabled={loading || isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("admin.permissions.delete")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading || isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || isSubmitting || !hasChanges}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                >
                  {(loading || isSubmitting) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  {t("common.save")}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
