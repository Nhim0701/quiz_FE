import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, type TranslationParams } from "@/i18n";
import { FormField, DatePickerField } from "@/components/common/form-field";
import { useApp, usePaginationStore } from "@/hooks";
import { userSchema, type UserFormData } from "../schemas";
import { useUsersStore, type User } from "../hooks";
import { FormDialog } from "@/components/common/form-dialog";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";

interface UserFormDialogProps {
  onDelete?: (user: User) => void;
  onClearFilters?: (() => void) | null;
}

/**
 * UserFormDialog extends FormDialog to provide user-specific form functionality.
 * It handles create, edit, and view modes for users.
 * Mode is automatically determined from store state.
 */
export function UserFormDialog({
  onDelete,
  onClearFilters,
}: UserFormDialogProps) {
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
    dialogMode,
    user,
    closeDialog,
    createUser,
    updateUser,
    refreshUsers,
    loading,
    isEditMode,
    setEditMode,
  } = useUsersStore();

  const [isDeleting, setIsDeleting] = useState(false);

  // Mode is always available when dialog is open
  const mode = (dialogMode ||
    (user ? DIALOG_MODES.VIEW : DIALOG_MODES.CREATE)) as FormDialogMode;
  const shouldShow = isDialogOpen && !!dialogMode;

  const methods = useForm<UserFormData>({
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

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = methods;

  // Reset form when user or mode changes
  useEffect(() => {
    if (shouldShow && user) {
      reset({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        birthday: user.birthday || "",
        address: user.address || "",
        jobTitle: user.jobTitle || "",
        company: user.company || "",
      });
    } else if (shouldShow && mode === DIALOG_MODES.CREATE) {
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
  }, [shouldShow, user, mode, reset]);

  const currentData = watch();
  const hasChanges = user
    ? currentData.fullName !== (user.fullName || "") ||
      currentData.email !== (user.email || "") ||
      currentData.phone !== (user.phone || "") ||
      currentData.birthday !== (user.birthday || "") ||
      currentData.address !== (user.address || "") ||
      currentData.jobTitle !== (user.jobTitle || "") ||
      currentData.company !== (user.company || "")
    : false;
  const isViewMode = mode === DIALOG_MODES.VIEW;
  const isDisabled = isViewMode && !isEditMode;

  const title = useMemo(
    () => ({
      create: t("admin.users.createTitle"),
      view: t("admin.users.viewTitle"),
      edit: t("admin.users.editTitle"),
    }),
    [t]
  );

  const description = useMemo(
    () => ({
      create: t("admin.users.createDescription"),
      view: t("admin.users.viewDescription"),
      edit: t("admin.users.editDescription"),
    }),
    [t]
  );

  const canSubmit = useMemo(() => {
    if (mode === DIALOG_MODES.CREATE)
      return !!(currentData.fullName?.trim() && currentData.email?.trim());
    if (mode === DIALOG_MODES.VIEW && isEditMode) return hasChanges;
    if (mode === DIALOG_MODES.EDIT) return true;
    return false;
  }, [mode, currentData, isEditMode, hasChanges]);

  // Helper to refresh users after mutation
  const handleRefresh = useCallback(
    async (refreshPage: number = page) => {
      await refreshUsers(refreshPage, pageSize);
    },
    [refreshUsers, page, pageSize]
  );

  const onSubmit = async (data: UserFormData) => {
    try {
      if (mode === DIALOG_MODES.CREATE) {
        await createUser(data);
        showSuccess(t("admin.users.createSuccess"));
        closeDialog();
        onClearFilters?.();
        await handleRefresh(1);
      } else if (user) {
        // Handle both VIEW (with edit mode) and EDIT modes
        await updateUser(user.id, data);
        showSuccess(t("admin.users.updateSuccess"));

        if (mode === DIALOG_MODES.VIEW) {
          setEditMode(false);
        } else {
          closeDialog();
        }

        await handleRefresh();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  const handleEdit = useCallback(() => {
    setEditMode(true);
  }, [setEditMode]);

  const handleCancel = useCallback(() => {
    if (isViewMode && isEditMode) {
      setEditMode(false);
      if (user) {
        reset({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          birthday: user.birthday || "",
          address: user.address || "",
          jobTitle: user.jobTitle || "",
          company: user.company || "",
        });
      }
    }
    closeDialog();
  }, [isViewMode, isEditMode, user, setEditMode, reset, closeDialog]);

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleDeleteClick = useCallback(() => {
    if (!user || !onDelete) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(user);
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
          {t("admin.users.confirmDelete", {
            name: user.fullName,
          } as TranslationParams<"admin.users.confirmDelete">)}
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
  }, [user, onDelete, t, showDialog, closeAppDialog, closeDialog, showError]);

  if (!shouldShow) return null;

  return (
    <FormDialog
      open={shouldShow}
      onOpenChange={(open) => !open && closeDialog()}
      mode={mode}
      isEditMode={isEditMode}
      title={title}
      description={description}
      onEdit={handleEdit}
      onDelete={onDelete ? handleDeleteClick : undefined}
      onCancel={handleCancel}
      onSubmit={handleFormSubmit}
      loading={loading}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      hasChanges={hasChanges}
      canSubmit={canSubmit}
      createLabel={t("admin.users.create")}
      saveLabel={t("common.save")}
      editLabel={t("common.edit")}
      deleteLabel={t("admin.users.delete")}
      cancelLabel={t("common.cancel")}
    >
      <FormProvider {...methods}>
        <Form className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="fullName"
              label={t("admin.users.form.fullNameLabel")}
              type="text"
              placeholder={t("admin.users.form.fullNamePlaceholder")}
              register={register("fullName")}
              error={errors.fullName}
              required
              disabled={isDisabled || loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="email"
              label={t("admin.users.form.emailLabel")}
              type="email"
              placeholder={t("admin.users.form.emailPlaceholder")}
              register={register("email")}
              error={errors.email}
              required
              disabled={isDisabled || loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="phone"
              label={t("admin.users.form.phoneLabel")}
              type="text"
              placeholder={t("admin.users.form.phonePlaceholder")}
              register={register("phone")}
              error={errors.phone}
              disabled={isDisabled || loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <DatePickerField
              id="birthday"
              label={t("admin.users.form.birthdayLabel")}
              name="birthday"
              control={control}
              error={errors.birthday}
              disabled={isDisabled || loading || isSubmitting}
              placeholder={t("admin.users.form.birthdayPlaceholder")}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="jobTitle"
              label={t("admin.users.form.jobTitleLabel")}
              type="text"
              placeholder={t("admin.users.form.jobTitlePlaceholder")}
              register={register("jobTitle")}
              error={errors.jobTitle}
              disabled={isDisabled || loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <FormField
              id="company"
              label={t("admin.users.form.companyLabel")}
              type="text"
              placeholder={t("admin.users.form.companyPlaceholder")}
              register={register("company")}
              error={errors.company}
              disabled={isDisabled || loading || isSubmitting}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
          </div>
          <FormField
            id="address"
            label={t("admin.users.form.addressLabel")}
            type="text"
            placeholder={t("admin.users.form.addressPlaceholder")}
            register={register("address")}
            error={errors.address}
            disabled={isDisabled || loading || isSubmitting}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
        </Form>
      </FormProvider>
    </FormDialog>
  );
}
