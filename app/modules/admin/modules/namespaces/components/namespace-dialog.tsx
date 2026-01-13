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
import { namespaceSchema, type NamespaceFormData } from "../schemas";
import { useNamespacesStore, type Namespace } from "../hooks";
import { Loader2, Edit, Trash2, Save, X } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";

interface NamespaceViewDialogProps {
  namespace: Namespace | null;
  onDelete: (namespace: Namespace) => void;
}

export function NamespaceViewDialog({
  namespace,
  onDelete,
}: NamespaceViewDialogProps) {
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
    viewingNamespace,
    isEditMode,
    closeDialog,
    updateNamespace,
    refreshNamespaces,
    loading,
    setEditMode,
  } = useNamespacesStore();

  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<NamespaceFormData>({
    resolver: zodResolver(namespaceSchema(t)),
    defaultValues: {
      name: "",
      prefix: "",
      description: "",
    },
  });

  useEffect(() => {
    if (viewingNamespace) {
      reset({
        name: viewingNamespace.name || "",
        prefix: viewingNamespace.prefix || "",
        description: viewingNamespace.description || "",
      });
    }
  }, [viewingNamespace, reset, isDialogOpen]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (viewingNamespace) {
      reset({
        name: viewingNamespace.name || "",
        prefix: viewingNamespace.prefix || "",
        description: viewingNamespace.description || "",
      });
    }
  };

  const onSubmit = async (data: NamespaceFormData) => {
    if (!viewingNamespace) return;

    try {
      await updateNamespace(viewingNamespace.id, data);
      showSuccess(t("admin.namespaces.updateSuccess"));
      setEditMode(false);
      await refreshNamespaces(page, pageSize);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  const handleDeleteClick = () => {
    if (!viewingNamespace) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(viewingNamespace);
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
      title: t("admin.namespaces.delete"),
      content: (
        <AlertDialogDescription>
          {(
            t as (
              key: string,
              params?: Record<string, string | number>
            ) => string
          )("admin.namespaces.confirmDelete", { name: viewingNamespace.name })}
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
            {t("admin.namespaces.delete")}
          </AlertDialogAction>
        </AlertDialogFooterComponent>
      ),
    });
  };

  if (!viewingNamespace || !isDialogOpen) return null;

  const currentData = watch();
  const hasChanges =
    currentData.name !== viewingNamespace.name ||
    currentData.prefix !== viewingNamespace.prefix ||
    currentData.description !== (viewingNamespace.description || "");

  return (
    <Dialog
      open={isDialogOpen && !!viewingNamespace}
      onOpenChange={(open) => !open && closeDialog()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.namespaces.viewTitle")}</DialogTitle>
          <DialogDescription>
            {t("admin.namespaces.viewDescription")}
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
            disabled={!isEditMode || loading || isSubmitting}
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
            disabled={!isEditMode || loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
          <FormField
            id="description"
            label={t("admin.namespaces.form.descriptionLabel")}
            type="text"
            placeholder={t("admin.namespaces.form.descriptionPlaceholder")}
            register={register("description")}
            error={errors.description}
            disabled={!isEditMode || loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
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
                  {t("admin.namespaces.delete")}
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
