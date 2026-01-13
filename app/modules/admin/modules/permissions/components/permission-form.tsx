import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { FormField, ComboboxField } from "@/components/common/form-field";
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
import { usePermissionsStore } from "../hooks";
import { useRolesStore } from "../../roles/hooks";
import { Loader2 } from "lucide-react";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants";

interface PermissionFormProps {
  onClearFilters?: (() => void) | null;
}

export function PermissionForm({ onClearFilters }: PermissionFormProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const { page, pageSize } = usePaginationStore();
  const {
    isDialogOpen,
    editingPermission,
    viewingPermission,
    closeDialog,
    createPermission,
    updatePermission,
    refreshPermissions,
    loading,
  } = usePermissionsStore();
  const { fetchRoles, roles } = useRolesStore();
  const isEditMode = !!editingPermission;

  // Only show this dialog when not viewing (i.e., creating or editing from create button)
  const shouldShow = isDialogOpen && !viewingPermission;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema(t)),
    defaultValues: {
      name: "",
      permission: "",
      description: "",
      roleId: "",
    },
  });

  // Fetch roles when dialog opens
  useEffect(() => {
    if (shouldShow) {
      fetchRoles(1, MAX_PAGE_SIZE_FOR_ALL);
    }
  }, [shouldShow, fetchRoles]);

  useEffect(() => {
    if (editingPermission) {
      reset({
        name: editingPermission.name || "",
        permission: editingPermission.permission || "",
        description: editingPermission.description || "",
        roleId: editingPermission.roleId || "",
      });
    } else {
      reset({
        name: "",
        permission: "",
        description: "",
        roleId: "",
      });
    }
  }, [editingPermission, reset, isDialogOpen]);

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const onSubmit = async (data: PermissionFormData) => {
    try {
      const submitData = {
        name: data.name,
        permission: data.permission,
        description: data.description || undefined,
        roleId: data.roleId,
      };

      if (isEditMode && editingPermission) {
        await updatePermission(editingPermission.id, submitData);
        showSuccess(t("admin.permissions.updateSuccess"));
        closeDialog();
        await refreshPermissions(page, pageSize);
      } else {
        await createPermission(submitData);
        showSuccess(t("admin.permissions.createSuccess"));
        closeDialog();
        // Clear filters and fetch all data after create
        if (onClearFilters) {
          onClearFilters();
        }
        await refreshPermissions(1, pageSize);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  return (
    <Dialog open={shouldShow} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("admin.permissions.editTitle")
              : t("admin.permissions.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("admin.permissions.editDescription")
              : t("admin.permissions.createDescription")}
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
              disabled={loading || isSubmitting}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="permission"
              label={t("admin.permissions.form.permissionLabel")}
              type="text"
              placeholder={t("admin.permissions.form.permissionPlaceholder")}
              register={register("permission")}
              error={errors.permission}
              required
              disabled={loading || isSubmitting}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <ComboboxField
              id="roleId"
              label={t("admin.permissions.form.roleLabel")}
              name="roleId"
              control={control}
              options={roleOptions}
              error={errors.roleId}
              required
              disabled={loading || isSubmitting}
              placeholder={t("admin.permissions.form.selectRole")}
              searchPlaceholder={t("admin.permissions.form.searchRole")}
              emptyMessage={t("admin.permissions.form.noRoleFound")}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="description"
              label={t("admin.permissions.form.descriptionLabel")}
              type="text"
              placeholder={t("admin.permissions.form.descriptionPlaceholder")}
              register={register("description")}
              error={errors.description}
              disabled={loading || isSubmitting}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeDialog}
              disabled={loading || isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              {(loading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode
                ? t("admin.permissions.update")
                : t("admin.permissions.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
