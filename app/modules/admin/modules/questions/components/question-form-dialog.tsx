import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, Controller, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { TextareaField, ComboboxField } from "@/components/common/form-field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCheck, Eye, Folder, Pencil } from "lucide-react";
import { useApp, useEditorStore, usePageData } from "@/hooks";
import { questionSchema, type QuestionFormData } from "../schemas";
import { useQuestionsStore } from "../hooks";
import { useTestsStore } from "../../tests/hooks";
import { useCategoriesStore } from "../../categories/hooks";
import { FormDialog } from "@/components/common/form-dialog";
import type { FormDialogMode } from "@/constants";
import { DIALOG_MODES } from "@/constants";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants/app";
import { ROUTES } from "../constants";
import type { QuestionProps } from "../types";
import { questionFormBuilder } from "../schemas/question-schema";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

interface QuestionFormDialogProps {
  onDelete?: (question: QuestionProps) => void;
  onClearFilters?: (() => void) | null;
  onRefresh?: () => Promise<void>;
}

/**
 * QuestionFormDialog extends FormDialog to provide question-specific form functionality.
 * It handles create, edit, and view modes for questions.
 * Mode is automatically determined from store state.
 */
export function QuestionFormDialog({
  onDelete,
  onClearFilters,
  onRefresh,
}: QuestionFormDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    showError,
    showSuccess,
    showDialog,
    closeDialog: closeAppDialog,
  } = useApp();
  const {
    isDialogOpen,
    dialogMode,
    question,
    closeDialog,
    createQuestion,
    updateQuestion,
    loading,
    isEditMode,
    setEditMode,
  } = useQuestionsStore();
  const { tests, fetchTests } = useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const { open: openEditor } = useEditorStore();

  // Fetch tests and categories when dialog opens
  usePageData(
    async () => {
      await Promise.all([
        fetchTests(1, MAX_PAGE_SIZE_FOR_ALL),
        fetchCategories(1, MAX_PAGE_SIZE_FOR_ALL),
      ]);
    },
    {
      errorKey: "errors.fetchDataFailed",
      showLoading: false,
      showError: false,
      onError: (error) => {
        console.error("Failed to fetch data:", error);
      },
    }
  );

  // Mode is always available when dialog is open
  const mode = (dialogMode ||
    (question ? DIALOG_MODES.VIEW : DIALOG_MODES.CREATE)) as FormDialogMode;
  const shouldShow = isDialogOpen && !!dialogMode;

  // Test options for combobox
  const testOptions = useMemo(() => {
    if (!tests || tests.length === 0) {
      return [];
    }
    return tests.map((test) => ({
      value: test.id,
      label: test.name,
    }));
  }, [tests]);

  // Get category name from selected test
  const selectedCategory = useMemo(() => {
    if (!selectedTestId || !tests || tests.length === 0) {
      return "";
    }
    const test = tests.find((t) => t.id === selectedTestId);
    if (!test || !test.categoryId) {
      return "";
    }
    const category = categories.find((c) => c.id === test.categoryId);
    return category?.name || "";
  }, [selectedTestId, tests, categories]);

  const methods = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema(t)),
    defaultValues: questionFormBuilder(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
    reset,
    watch,
  } = methods;

  const watchedTestId = watch("testId");
  const currentValues = watch();

  // Update selectedTestId and categoryId when form testId changes
  useEffect(() => {
    if (watchedTestId) {
      setSelectedTestId(watchedTestId);
      // Update categoryId when test is selected
      const selectedTest = tests.find((t) => t.id === watchedTestId);
      if (selectedTest?.categoryId) {
        setValue("categoryId", selectedTest.categoryId);
      } else {
        setValue("categoryId", "");
      }
    } else {
      setSelectedTestId("");
      setValue("categoryId", "");
    }
  }, [watchedTestId, tests, setValue]);

  // Reset form when question or mode changes
  useEffect(() => {
    if (shouldShow && question) {
      // Extract testId from question (assuming question has test property or we need to find it)
      const questionTest = tests.find(
        (t) => t.name === question.test || t.id === question.test
      );
      const testId = questionTest?.id || "";

      reset(questionFormBuilder(testId, question));
      setSelectedTestId(testId);
    } else if (shouldShow && mode === DIALOG_MODES.CREATE) {
      reset(questionFormBuilder());
      setSelectedTestId("");
    }
  }, [shouldShow, question, mode, reset, tests]);

  const hasChanges = question
    ? currentValues.content !== question.content ||
      currentValues.isMultipleChoice !== question.isMultipleChoice ||
      currentValues.testId !==
        (tests.find((t) => t.name === question.test || t.id === question.test)
          ?.id || "")
    : false;
  const isViewMode = mode === DIALOG_MODES.VIEW;
  const isDisabled = isViewMode && !isEditMode;

  const title = useMemo(
    () => ({
      create: t("admin.questions.createTitle"),
      view: t("admin.questions.viewTitle"),
      edit: t("admin.questions.editTitle"),
    }),
    [t]
  );

  const description = useMemo(
    () => ({
      create: t("admin.questions.createDescription"),
      view: t("admin.questions.viewDescription"),
      edit: t("admin.questions.editDescription"),
    }),
    [t]
  );

  const canSubmit = useMemo(() => {
    if (mode === DIALOG_MODES.CREATE)
      return !!currentValues.content.trim() && !!currentValues.testId;
    if (mode === DIALOG_MODES.VIEW && isEditMode) return hasChanges;
    if (mode === DIALOG_MODES.EDIT) return true;
    return false;
  }, [mode, currentValues, isEditMode, hasChanges]);

  const onSubmit = async (data: QuestionFormData) => {
    try {
      if (mode === DIALOG_MODES.CREATE) {
        // Specifically create question logic: will redirect to the question info page
        const createdQuestion = await createQuestion({
          testId: data.testId,
          content: data.content,
          isMultipleChoice: data.isMultipleChoice || false,
          categoryId: data.categoryId,
        });
        showSuccess(t("admin.questions.createSuccess"));
        closeDialog();
        return navigate(ROUTES.VIEW(createdQuestion.id));
        // onClearFilters?.();
        // onRefresh && (await onRefresh());
      } else if (question) {
        // Handle both VIEW (with edit mode) and EDIT modes
        // Note: updateQuestion requires testId and questionId
        // This might need to be adjusted based on your API structure
        const testId =
          data.testId ||
          tests.find((t) => t.name === question.test || t.id === question.test)
            ?.id ||
          "";
        await updateQuestion(testId, question.id, {
          content: data.content,
          isMultipleChoice: data.isMultipleChoice || false,
          testId: data.testId,
          categoryId: data.categoryId,
        });
        showSuccess(t("admin.questions.updateSuccess"));

        if (mode === DIALOG_MODES.VIEW) {
          setEditMode(false);
        } else {
          closeDialog();
        }
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
      if (question) {
        const questionTest = tests.find(
          (t) => t.name === question.test || t.id === question.test
        );
        const testId = questionTest?.id || "";
        reset({
          content: question.content || "",
          testId: testId,
          categoryId: question.category || "",
          isMultipleChoice: question.isMultipleChoice || false,
        });
        setSelectedTestId(testId);
      }
    }
    closeDialog();
  }, [
    isViewMode,
    isEditMode,
    question,
    setEditMode,
    reset,
    closeDialog,
    tests,
  ]);

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleDeleteClick = useCallback(() => {
    if (!question || !onDelete) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(question);
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
      title: t("admin.questions.delete"),
      content: (
        <AlertDialogDescription>
          {t("admin.questions.confirmDelete")}
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
            {t("admin.questions.delete")}
          </AlertDialogAction>
        </AlertDialogFooterComponent>
      ),
    });
  }, [
    question,
    onDelete,
    t,
    showDialog,
    closeAppDialog,
    closeDialog,
    showError,
  ]);

  const handleEditContent = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const value = getValues("content") || "";
    openEditor({
      content: value,
      mode: "editor",
      title: `${t("common.edit")}: ${t("admin.questions.fields.content")}`,
      loadingLabel: t("common.saving"),
      callback: (content) => {
        setValue("content", content || "");
      },
    });
  };

  const handlePreviewContent = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    openEditor({
      content: getValues("content") || "",
      mode: "html",
      title: `${t("common.preview")}: ${t("admin.questions.fields.content")}`,
    });
  };

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
      createLabel={t("admin.questions.create")}
      saveLabel={t("common.save")}
      editLabel={t("common.edit")}
      deleteLabel={t("admin.questions.delete")}
      cancelLabel={t("common.cancel")}
    >
      <FormProvider {...methods}>
        <Form className="mt-6 space-y-4">
          <div className="space-y-2">
            <TextareaField
              id="content"
              label={t("admin.questions.fields.content")}
              rows={4}
              className="hidden"
              placeholder={t("admin.questions.form.contentPlaceholder")}
              register={register("content")}
              error={errors.content}
              required
              disabled
              labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleEditContent}>
                <Pencil className="h-4 w-4 text-green-500 dark:text-green-400" />
                {t("common.edit")}
              </Button>
              <Button variant="outline" onClick={handlePreviewContent}>
                <Eye className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                {t("common.preview")}
              </Button>
            </div>
          </div>

          <ComboboxField
            id="testId"
            label={t("admin.questions.filters.test")}
            name="testId"
            control={control}
            options={testOptions}
            error={errors.testId}
            required
            disabled={isDisabled || loading || isSubmitting}
            placeholder={t("admin.questions.filters.testPlaceholder")}
            searchPlaceholder={t("admin.questions.filters.testSearch")}
            emptyMessage={t("admin.questions.filters.testEmpty")}
            labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />

          {/* Category Field (Disabled) - Display category name */}
          <div>
            <Label
              htmlFor="categoryId"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              <Folder className="h-4 w-4 text-green-500 dark:text-green-400" />
              <span>{t("admin.questions.filters.category")}</span>
              <span className="text-red-500 dark:text-red-400 ml-1">*</span>
            </Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    id="categoryId"
                    type="text"
                    value={selectedCategory || ""}
                    placeholder={t(
                      "admin.questions.filters.categoryPlaceholder"
                    )}
                    disabled={true}
                    readOnly
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.categoryId && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Multiple Choice Checkbox */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCheck className="h-4 w-4 text-green-500 dark:text-green-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.questions.columns.isMultipleChoice")}
              </span>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Controller
                name="isMultipleChoice"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="isMultipleChoice"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      disabled={isDisabled || loading || isSubmitting}
                    />
                    <Label
                      htmlFor="isMultipleChoice"
                      className="text-sm text-muted-foreground"
                    >
                      {t("admin.questions.multipleChoice")}
                    </Label>
                  </div>
                )}
              />
            </div>
          </div>
        </Form>
      </FormProvider>
    </FormDialog>
  );
}
