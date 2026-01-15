import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, type TranslationParams } from "@/i18n";
import {
  FormField,
  TextareaField,
  ComboboxField,
} from "@/components/common/form-field";
import { useApp } from "@/hooks";
import { testSchema, type TestFormData } from "../schemas";
import { useTestsStore, type TestProps } from "../hooks";
import { FormDialog } from "@/components/common/form-dialog";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";
import { useCategoriesStore } from "../../categories/hooks";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants";
import { usePageData } from "@/hooks";
import { testFormBuilder } from "../schemas/test-schema";

interface TestFormDialogProps {
  onDelete?: (test: TestProps) => void;
  onClearFilters?: (() => void) | null;
  onRefresh?: () => Promise<void>;
}

/**
 * TestFormDialog extends FormDialog to provide test-specific form functionality.
 * It handles create, edit, and view modes for tests.
 * Mode is automatically determined from store state.
 */
export function TestFormDialog({
  onDelete,
  onClearFilters,
  onRefresh,
}: TestFormDialogProps) {
  const { t } = useTranslation();
  const {
    showError,
    showSuccess,
    showDialog,
    closeDialog: closeAppDialog,
  } = useApp();
  const {
    isDialogOpen,
    dialogMode,
    test,
    closeDialog,
    createTest,
    updateTest,
    loading,
    isEditMode,
    setEditMode,
  } = useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories when dialog opens
  usePageData(() => fetchCategories(1, MAX_PAGE_SIZE_FOR_ALL), {
    errorKey: "errors.fetchCategoriesFailed",
    showLoading: false,
    showError: false,
    onError: (error) => {
      console.error("Failed to fetch categories:", error);
    },
  });

  // Mode is always available when dialog is open
  const mode = (dialogMode ||
    (test ? DIALOG_MODES.VIEW : DIALOG_MODES.CREATE)) as FormDialogMode;
  const shouldShow = isDialogOpen && !!dialogMode;

  // Convert categories to combobox options
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories]
  );

  const methods = useForm<TestFormData>({
    resolver: zodResolver(testSchema(t)),
    defaultValues: testFormBuilder(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    control,
  } = methods;

  // Reset form when test or mode changes
  useEffect(() => {
    if (shouldShow && test) {
      reset(testFormBuilder(test));
    } else if (shouldShow && mode === DIALOG_MODES.CREATE) {
      reset(testFormBuilder());
    }
  }, [shouldShow, test, mode, reset]);

  const currentValues = watch();
  const hasChanges = test
    ? currentValues.name !== test.name ||
      currentValues.categoryId !== test.categoryId ||
      currentValues.description !== (test.description || "") ||
      currentValues.timeLimit !== test.timeLimit
    : false;
  const isViewMode = mode === DIALOG_MODES.VIEW;
  const isDisabled = isViewMode && !isEditMode;

  const title = useMemo(
    () => ({
      create: t("admin.tests.createTitle"),
      view: t("admin.tests.viewTitle"),
      edit: t("admin.tests.editTitle"),
    }),
    [t]
  );

  const description = useMemo(
    () => ({
      create: t("admin.tests.createDescription"),
      view: t("admin.tests.viewDescription"),
      edit: t("admin.tests.editDescription"),
    }),
    [t]
  );

  const canSubmit = useMemo(() => {
    if (mode === DIALOG_MODES.CREATE)
      return (
        !!currentValues.name.trim() &&
        !!currentValues.categoryId &&
        !!currentValues.timeLimit
      );
    if (mode === DIALOG_MODES.VIEW && isEditMode) return hasChanges;
    if (mode === DIALOG_MODES.EDIT) return true;
    return false;
  }, [mode, currentValues, isEditMode, hasChanges]);

  const onSubmit = useCallback(
    async (data: TestFormData) => {
      try {
        if (mode === DIALOG_MODES.CREATE) {
          await createTest(data);
          showSuccess(t("admin.tests.createSuccess"));
          closeDialog();
          onClearFilters?.();
          onRefresh && (await onRefresh());
        } else if (test) {
          await updateTest(test.id, data);
          showSuccess(t("admin.tests.updateSuccess"));

          if (mode === DIALOG_MODES.VIEW) {
            setEditMode(false);
          } else {
            closeDialog();
          }
          onRefresh && (await onRefresh());
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      }
    },
    [
      mode,
      createTest,
      showSuccess,
      t,
      closeDialog,
      onClearFilters,
      onRefresh,
      test,
      updateTest,
      setEditMode,
      showError,
    ]
  );

  const handleEdit = useCallback(() => {
    setEditMode(true);
  }, [setEditMode]);

  const handleCancel = useCallback(() => {
    if (isViewMode && isEditMode) {
      setEditMode(false);
      if (test) {
        reset({
          name: test.name || "",
          categoryId: test.categoryId || "",
          description: test.description || "",
          timeLimit: test.timeLimit,
        });
      }
    }
    closeDialog();
  }, [isViewMode, isEditMode, test, setEditMode, reset, closeDialog]);

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleDeleteClick = useCallback(() => {
    if (!test || !onDelete) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(test);
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
      title: t("admin.tests.delete"),
      content: (
        <AlertDialogDescription>
          {t("admin.tests.confirmDelete", {
            name: test.name,
          } as TranslationParams<"admin.tests.confirmDelete">)}
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
            {t("admin.tests.delete")}
          </AlertDialogAction>
        </AlertDialogFooterComponent>
      ),
    });
  }, [test, onDelete, t, showDialog, closeAppDialog, closeDialog, showError]);

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
      createLabel={t("admin.tests.create")}
      saveLabel={t("common.save")}
      editLabel={t("common.edit")}
      deleteLabel={t("admin.tests.delete")}
      cancelLabel={t("common.cancel")}
    >
      <FormProvider {...methods}>
        <Form className="mt-6 space-y-4">
          <FormField
            id="name"
            label={t("admin.tests.form.nameLabel")}
            type="text"
            placeholder={t("admin.tests.form.namePlaceholder")}
            register={register("name")}
            error={errors.name}
            required
            disabled={isDisabled || loading || isSubmitting}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />

          <ComboboxField
            id="categoryId"
            label={t("admin.tests.form.categoryLabel")}
            name="categoryId"
            control={control}
            options={categoryOptions}
            error={errors.categoryId}
            required
            disabled={isDisabled || loading || isSubmitting}
            placeholder={t("admin.tests.form.selectCategory")}
            searchPlaceholder={t("admin.tests.form.searchCategory")}
            emptyMessage={t("admin.tests.form.noCategoryFound")}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />

          <TextareaField
            id="description"
            label={t("admin.tests.form.descriptionLabel")}
            rows={4}
            placeholder={t("admin.tests.form.descriptionPlaceholder")}
            register={register("description")}
            error={errors.description}
            disabled={isDisabled || loading || isSubmitting}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />

          <FormField
            id="timeLimit"
            label={t("admin.tests.form.timeLimitLabel")}
            type="number"
            min="1"
            placeholder={t("admin.tests.form.timeLimitPlaceholder")}
            register={register("timeLimit", {
              valueAsNumber: true,
            })}
            error={errors.timeLimit}
            required
            disabled={isDisabled || loading || isSubmitting}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />
        </Form>
      </FormProvider>
    </FormDialog>
  );
}
