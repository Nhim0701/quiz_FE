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
import { roleSchema, type RoleFormData } from "../schemas";
import { useRolesStore, type Role } from "../hooks";
import { Loader2, Edit, Trash2, Save, X } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";

interface RoleViewDialogProps {
  role: Role | null;
  onDelete: (role: Role) => void;
}

export function RoleViewDialog({ role, onDelete }: RoleViewDialogProps) {
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
    viewingRole,
    isEditMode,
    closeDialog,
    updateRole,
    refreshRoles,
    loading,
    setEditMode,
  } = useRolesStore();

  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema(t)),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (viewingRole) {
      reset({
        name: viewingRole.name || "",
        description: viewingRole.description || "",
      });
    }
  }, [viewingRole, reset, isDialogOpen]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (viewingRole) {
      reset({
        name: viewingRole.name || "",
        description: viewingRole.description || "",
      });
    }
  };

  const onSubmit = async (data: RoleFormData) => {
    if (!viewingRole) return;

    try {
      await updateRole(viewingRole.id, data);
      showSuccess(t("admin.roles.updateSuccess"));
      setEditMode(false);
      await refreshRoles(page, pageSize);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  const handleDeleteClick = () => {
    if (!viewingRole) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(viewingRole);
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
      title: t("admin.roles.delete"),
      content: (
        <AlertDialogDescription>
          {(
            t as (
              key: string,
              params?: Record<string, string | number>
            ) => string
          )("admin.roles.confirmDelete", { name: viewingRole.name })}
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
            {t("admin.roles.delete")}
          </AlertDialogAction>
        </AlertDialogFooterComponent>
      ),
    });
  };

  if (!viewingRole || !isDialogOpen) return null;

  const currentData = watch();
  const hasChanges =
    currentData.name !== viewingRole.name ||
    currentData.description !== (viewingRole.description || "");

  return (
    <Dialog
      open={isDialogOpen && !!viewingRole}
      onOpenChange={(open) => !open && closeDialog()}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("admin.roles.viewTitle")}</DialogTitle>
          <DialogDescription>
            {t("admin.roles.viewDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              id="name"
              label={t("admin.roles.form.nameLabel")}
              type="text"
              placeholder={t("admin.roles.form.namePlaceholder")}
              register={register("name")}
              error={errors.name}
              required
              disabled={!isEditMode || loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="description"
              label={t("admin.roles.form.descriptionLabel")}
              type="text"
              placeholder={t("admin.roles.form.descriptionPlaceholder")}
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
                  {t("admin.roles.delete")}
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
