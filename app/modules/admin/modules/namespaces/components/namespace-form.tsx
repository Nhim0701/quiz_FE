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
import { namespaceSchema, type NamespaceFormData } from "../schemas";
import { useNamespacesStore } from "../hooks";
import { Loader2 } from "lucide-react";

interface NamespaceFormProps {
  onClearFilters?: (() => void) | null;
}

export function NamespaceForm({ onClearFilters }: NamespaceFormProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const { page, pageSize } = usePaginationStore();
  const {
    isDialogOpen,
    editingNamespace,
    viewingNamespace,
    closeDialog,
    createNamespace,
    updateNamespace,
    refreshNamespaces,
    loading,
  } = useNamespacesStore();
  const isEditMode = !!editingNamespace;

  // Only show this dialog when not viewing (i.e., creating or editing from create button)
  const shouldShow = isDialogOpen && !viewingNamespace;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NamespaceFormData>({
    resolver: zodResolver(namespaceSchema(t)),
    defaultValues: {
      name: "",
      prefix: "",
      description: "",
    },
  });

  useEffect(() => {
    if (editingNamespace) {
      reset({
        name: editingNamespace.name || "",
        prefix: editingNamespace.prefix || "",
        description: editingNamespace.description || "",
      });
    } else {
      reset({
        name: "",
        prefix: "",
        description: "",
      });
    }
  }, [editingNamespace, reset, isDialogOpen]);

  const onSubmit = async (data: NamespaceFormData) => {
    try {
      if (isEditMode && editingNamespace) {
        await updateNamespace(editingNamespace.id, data);
        showSuccess(t("admin.namespaces.updateSuccess"));
        closeDialog();
        await refreshNamespaces(page, pageSize);
      } else {
        await createNamespace(data);
        showSuccess(t("admin.namespaces.createSuccess"));
        closeDialog();
        // Clear filters and fetch all data after create
        if (onClearFilters) {
          onClearFilters();
        }
        await refreshNamespaces(1, pageSize);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  return (
    <Dialog open={shouldShow} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("admin.namespaces.editTitle")
              : t("admin.namespaces.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("admin.namespaces.editDescription")
              : t("admin.namespaces.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField
            id="name"
            label={t("admin.namespaces.form.nameLabel")}
            type="text"
            placeholder={t("admin.namespaces.form.namePlaceholder")}
            register={register("name")}
            error={errors.name}
            required
            disabled={loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
          <FormField
            id="prefix"
            label={t("admin.namespaces.form.prefixLabel")}
            type="text"
            placeholder={t("admin.namespaces.form.prefixPlaceholder")}
            register={register("prefix")}
            error={errors.prefix}
            required
            disabled={loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
          <FormField
            id="description"
            label={t("admin.namespaces.form.descriptionLabel")}
            type="text"
            placeholder={t("admin.namespaces.form.descriptionPlaceholder")}
            register={register("description")}
            error={errors.description}
            disabled={loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
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
                ? t("admin.namespaces.update")
                : t("admin.namespaces.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
