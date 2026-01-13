import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { FormField, DatePickerField } from "@/components/common/form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useApp, usePaginationStore } from "@/hooks";
import { userSchema, type UserFormData } from "../schemas";
import { useUsersStore, type User } from "../hooks";
import { Loader2, Edit, Trash2, Save, X } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";

interface UserViewDialogProps {
  user: User | null;
  onDelete: (user: User) => void;
}

export function UserViewDialog({ user, onDelete }: UserViewDialogProps) {
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
    viewingUser,
    isEditMode,
    closeDialog,
    updateUser,
    refreshUsers,
    loading,
    setEditMode,
  } = useUsersStore();

  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema(t)),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      birthday: "",
      address: "",
      jobTitle: "",
      company: "",
    },
  });

  useEffect(() => {
    if (viewingUser) {
      reset({
        fullName: viewingUser.fullName || "",
        email: viewingUser.email || "",
        phone: viewingUser.phone || "",
        birthday: viewingUser.birthday || "",
        address: viewingUser.address || "",
        jobTitle: viewingUser.jobTitle || "",
        company: viewingUser.company || "",
      });
    }
  }, [viewingUser, reset, isDialogOpen]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (viewingUser) {
      reset({
        fullName: viewingUser.fullName || "",
        email: viewingUser.email || "",
        phone: viewingUser.phone || "",
        birthday: viewingUser.birthday || "",
        address: viewingUser.address || "",
        jobTitle: viewingUser.jobTitle || "",
        company: viewingUser.company || "",
      });
    }
  };

  const onSubmit = async (data: UserFormData) => {
    if (!viewingUser) return;

    try {
      await updateUser(viewingUser.id, data);
      showSuccess(t("admin.users.updateSuccess"));
      setEditMode(false);
      await refreshUsers(page, pageSize);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  const handleDeleteClick = () => {
    if (!viewingUser) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(viewingUser);
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
      title: t("admin.users.delete"),
      content: (
        <AlertDialogDescription>
          {(
            t as (
              key: string,
              params?: Record<string, string | number>
            ) => string
          )("admin.users.confirmDelete", { name: viewingUser.fullName })}
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
            {t("admin.users.delete")}
          </AlertDialogAction>
        </AlertDialogFooterComponent>
      ),
    });
  };

  if (!viewingUser || !isDialogOpen) return null;

  const currentData = watch();
  const hasChanges =
    currentData.fullName !== viewingUser.fullName ||
    currentData.email !== viewingUser.email ||
    currentData.phone !== (viewingUser.phone || "") ||
    currentData.birthday !== (viewingUser.birthday || "") ||
    currentData.address !== (viewingUser.address || "") ||
    currentData.jobTitle !== (viewingUser.jobTitle || "") ||
    currentData.company !== (viewingUser.company || "");

  return (
    <Dialog
      open={isDialogOpen && !!viewingUser}
      onOpenChange={(open) => !open && closeDialog()}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("admin.users.viewTitle")}</DialogTitle>
          <DialogDescription>
            {t("admin.users.viewDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="fullName"
              label={t("admin.users.form.fullNameLabel")}
              type="text"
              placeholder={t("admin.users.form.fullNamePlaceholder")}
              register={register("fullName")}
              error={errors.fullName}
              required
              disabled={!isEditMode || loading || isSubmitting}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="email"
              label={t("admin.users.form.emailLabel")}
              type="email"
              placeholder={t("admin.users.form.emailPlaceholder")}
              register={register("email")}
              error={errors.email}
              required
              disabled={!isEditMode || loading || isSubmitting}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="phone"
              label={t("admin.users.form.phoneLabel")}
              type="text"
              placeholder={t("admin.users.form.phonePlaceholder")}
              register={register("phone")}
              error={errors.phone}
              disabled={!isEditMode || loading || isSubmitting}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <DatePickerField
              id="birthday"
              label={t("admin.users.form.birthdayLabel")}
              name="birthday"
              control={control}
              error={errors.birthday}
              disabled={!isEditMode || loading || isSubmitting}
              placeholder={t("admin.users.form.birthdayPlaceholder")}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="jobTitle"
              label={t("admin.users.form.jobTitleLabel")}
              type="text"
              placeholder={t("admin.users.form.jobTitlePlaceholder")}
              register={register("jobTitle")}
              error={errors.jobTitle}
              disabled={!isEditMode || loading || isSubmitting}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="company"
              label={t("admin.users.form.companyLabel")}
              type="text"
              placeholder={t("admin.users.form.companyPlaceholder")}
              register={register("company")}
              error={errors.company}
              disabled={!isEditMode || loading || isSubmitting}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
          </div>
          <FormField
            id="address"
            label={t("admin.users.form.addressLabel")}
            type="text"
            placeholder={t("admin.users.form.addressPlaceholder")}
            register={register("address")}
            error={errors.address}
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
                  {t("admin.users.delete")}
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
