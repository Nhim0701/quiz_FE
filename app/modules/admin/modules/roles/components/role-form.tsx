import { useEffect } from "react";
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
import { useRolesStore } from "../hooks";
import { Loader2 } from "lucide-react";

interface RoleFormProps {
  onClearFilters?: (() => void) | null;
}

export function RoleForm({ onClearFilters }: RoleFormProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const { page, pageSize } = usePaginationStore();
  const {
    isDialogOpen,
    editingRole,
    viewingRole,
    closeDialog,
    createRole,
    updateRole,
    refreshRoles,
    loading,
  } = useRolesStore();
  const isEditMode = !!editingRole;

  // Only show this dialog when not viewing (i.e., creating or editing from create button)
  const shouldShow = isDialogOpen && !viewingRole;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema(t)),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (editingRole) {
      reset({
        name: editingRole.name || "",
        description: editingRole.description || "",
      });
    } else {
      reset({
        name: "",
        description: "",
      });
    }
  }, [editingRole, reset, isDialogOpen]);

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (isEditMode && editingRole) {
        await updateRole(editingRole.id, data);
        showSuccess(t("admin.roles.updateSuccess"));
        closeDialog();
        await refreshRoles(page, pageSize);
      } else {
        await createRole(data);
        showSuccess(t("admin.roles.createSuccess"));
        closeDialog();
        // Clear filters and fetch all data after create
        if (onClearFilters) {
          onClearFilters();
        }
        await refreshRoles(1, pageSize);
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
              ? t("admin.roles.editTitle")
              : t("admin.roles.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("admin.roles.editDescription")
              : t("admin.roles.createDescription")}
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
              disabled={loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="description"
              label={t("admin.roles.form.descriptionLabel")}
              type="text"
              placeholder={t("admin.roles.form.descriptionPlaceholder")}
              register={register("description")}
              error={errors.description}
              disabled={loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
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
              {isEditMode ? t("admin.roles.update") : t("admin.roles.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
