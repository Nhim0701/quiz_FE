import { useEffect } from "react";
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
import { useUsersStore } from "../hooks";
import { Loader2 } from "lucide-react";

interface UserFormProps {
  onClearFilters?: (() => void) | null;
}

export function UserForm({ onClearFilters }: UserFormProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const { page, pageSize } = usePaginationStore();
  const {
    isDialogOpen,
    editingUser,
    viewingUser,
    closeDialog,
    createUser,
    updateUser,
    refreshUsers,
    loading,
  } = useUsersStore();
  const isEditMode = !!editingUser;

  // Only show this dialog when not viewing (i.e., creating or editing from create button)
  const shouldShow = isDialogOpen && !viewingUser;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
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
    if (editingUser) {
      reset({
        fullName: editingUser.fullName || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        birthday: editingUser.birthday || "",
        address: editingUser.address || "",
        jobTitle: editingUser.jobTitle || "",
        company: editingUser.company || "",
      });
    } else {
      reset({
        fullName: "",
        email: "",
        phone: "",
        birthday: "",
        address: "",
        jobTitle: "",
        company: "",
      });
    }
  }, [editingUser, reset, isDialogOpen]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditMode && editingUser) {
        await updateUser(editingUser.id, data);
        showSuccess(t("admin.users.updateSuccess"));
        closeDialog();
        await refreshUsers(page, pageSize);
      } else {
        await createUser(data);
        showSuccess(t("admin.users.createSuccess"));
        closeDialog();
        // Clear filters and fetch all data after create
        if (onClearFilters) {
          onClearFilters();
        }
        await refreshUsers(1, pageSize);
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
              ? t("admin.users.editTitle")
              : t("admin.users.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("admin.users.editDescription")
              : t("admin.users.createDescription")}
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
              disabled={loading || isSubmitting}
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
              disabled={loading || isSubmitting}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="phone"
              label={t("admin.users.form.phoneLabel")}
              type="text"
              placeholder={t("admin.users.form.phonePlaceholder")}
              register={register("phone")}
              error={errors.phone}
              disabled={loading || isSubmitting}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <DatePickerField
              id="birthday"
              label={t("admin.users.form.birthdayLabel")}
              name="birthday"
              control={control}
              error={errors.birthday}
              disabled={loading || isSubmitting}
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
              disabled={loading || isSubmitting}
              labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="company"
              label={t("admin.users.form.companyLabel")}
              type="text"
              placeholder={t("admin.users.form.companyPlaceholder")}
              register={register("company")}
              error={errors.company}
              disabled={loading || isSubmitting}
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
              {isEditMode ? t("admin.users.update") : t("admin.users.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
