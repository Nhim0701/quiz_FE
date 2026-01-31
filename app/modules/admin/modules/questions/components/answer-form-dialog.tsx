import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, Controller, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { TextareaField } from "@/components/common/form-field";
import { Label } from "@/components/ui/label";
import { useApp, useEditorStore } from "@/hooks";
import type { AnswerProps } from "../types";
import { useAnswerStore } from "../hooks";
import {
  FileText,
  CheckSquare,
  MessageSquare,
  Pencil,
  Eye,
} from "lucide-react";
import {
  answerSchema,
  answerFormBuilder,
  type AnswerFormData,
} from "../schemas/anwser-schema";
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
import { Button } from "@/components/ui/button";

interface AnswerFormDialogProps {
  onDelete?: (answer: AnswerProps) => void;
  onRefresh?: () => Promise<void>;
}

/**
 * AnswerFormDialog extends FormDialog to provide answer-specific form functionality.
 * It handles create, edit, and view modes for answers.
 * Mode is automatically determined from store state.
 */
export function AnswerFormDialog({
  onDelete,
  onRefresh,
}: AnswerFormDialogProps) {
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
    answer,
    questionId,
    closeDialog,
    createAnswer,
    updateAnswer,
    loading,
    isEditMode,
    setEditMode,
  } = useAnswerStore();

  const [isDeleting, setIsDeleting] = useState(false);
  const { open: openEditor } = useEditorStore();

  const mode = (dialogMode ||
    (answer ? DIALOG_MODES.VIEW : DIALOG_MODES.CREATE)) as FormDialogMode;
  const shouldShow = isDialogOpen && !!dialogMode && !!questionId;

  const methods = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema(t)),
    defaultValues: answerFormBuilder(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    getValues,
    setValue,
  } = methods;

  const currentValues = watch();

  useEffect(() => {
    if (shouldShow && answer) {
      reset(answerFormBuilder(answer));
    } else if (shouldShow && mode === DIALOG_MODES.CREATE) {
      reset(answerFormBuilder());
    }
  }, [shouldShow, answer, mode, reset]);

  const hasChanges = answer
    ? currentValues.content !== answer.content ||
      currentValues.isCorrect !== answer.isCorrect ||
      currentValues.explanation !== (answer.explanation || "")
    : false;
  const isViewMode = mode === DIALOG_MODES.VIEW;
  const isDisabled = isViewMode && !isEditMode;

  const title = useMemo(
    () => ({
      create: t("admin.questions.answers.create"),
      view: t("admin.questions.answers.viewTitle"),
      edit: t("admin.questions.answers.editTitle"),
    }),
    [t]
  );

  const description = useMemo(
    () => ({
      create: t("admin.questions.answers.editDescription"),
      view: t("admin.questions.answers.viewDescription"),
      edit: t("admin.questions.answers.editDescription"),
    }),
    [t]
  );

  const canSubmit = useMemo(() => {
    if (mode === DIALOG_MODES.CREATE) return !!currentValues.content.trim();
    if (mode === DIALOG_MODES.VIEW && isEditMode) return hasChanges;
    if (mode === DIALOG_MODES.EDIT) return true;
    return false;
  }, [mode, currentValues, isEditMode, hasChanges]);

  const onSubmit = async (data: AnswerFormData) => {
    if (!questionId) return;

    try {
      if (mode === DIALOG_MODES.CREATE) {
        await createAnswer(questionId, {
          content: data.content,
          isCorrect: data.isCorrect || false,
          explanation: data.explanation || "",
        });
        showSuccess(t("admin.questions.answers.createSuccess"));
        closeDialog();
        onRefresh && (await onRefresh());
      } else if (answer) {
        await updateAnswer(answer.id, {
          content: data.content,
          isCorrect: data.isCorrect || false,
          explanation: data.explanation || "",
        });
        showSuccess(t("admin.questions.answers.updateSuccess"));

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
  };

  const handleEdit = useCallback(() => {
    setEditMode(true);
  }, [setEditMode]);

  const handleCancel = useCallback(() => {
    if (isViewMode && isEditMode && answer) {
      reset(answerFormBuilder(answer));
    }
    closeDialog();
  }, [isViewMode, isEditMode, answer, reset, closeDialog]);

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleDeleteClick = useCallback(() => {
    if (!answer || !questionId || !onDelete) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(answer);
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
      title: t("admin.questions.answers.delete"),
      content: (
        <AlertDialogDescription>
          {t("admin.questions.answers.confirmDelete")}
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
            {t("admin.questions.answers.delete")}
          </AlertDialogAction>
        </AlertDialogFooterComponent>
      ),
    });
  }, [
    answer,
    questionId,
    onDelete,
    t,
    showDialog,
    closeAppDialog,
    closeDialog,
    showError,
  ]);

  const handleEditContent = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const value = getValues("content") || "";
      openEditor({
        content: value,
        mode: "editor",
        title: `${t("common.edit")}: ${t("admin.questions.answers.columns.content")}`,
        loadingLabel: t("common.saving"),
        callback: (content) => {
          setValue("content", content || "");
        },
      });
    },
    [getValues, openEditor, setValue, t]
  );

  const handlePreviewContent = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      openEditor({
        content: getValues("content") || "",
        mode: "html",
        title: `${t("common.preview")}: ${t("admin.questions.answers.columns.content")}`,
      });
    },
    [getValues, openEditor, t]
  );

  const handleEditExplanation = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const value = getValues("explanation") || "";
      openEditor({
        content: value,
        mode: "editor",
        title: `${t("common.edit")}: ${t("admin.questions.answers.columns.explanation")}`,
        loadingLabel: t("common.saving"),
        callback: (content) => {
          setValue("explanation", content || "");
        },
      });
    },
    [getValues, openEditor, setValue, t]
  );

  const handlePreviewExplanation = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      openEditor({
        content: getValues("explanation") || "",
        mode: "html",
        title: `${t("common.preview")}: ${t("admin.questions.answers.columns.explanation")}`,
      });
    },
    [getValues, openEditor, t]
  );

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
      createLabel={t("admin.questions.answers.create")}
      saveLabel={t("common.save")}
      editLabel={t("common.edit")}
      deleteLabel={t("admin.questions.answers.delete")}
      cancelLabel={t("common.cancel")}
    >
      <FormProvider {...methods}>
        <Form className="mt-6 space-y-4">
          {/* Content Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <Label
                htmlFor="content"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                {t("admin.questions.answers.columns.content")}
                <span className="text-red-500 dark:text-red-400 ml-1">*</span>
              </Label>
            </div>
            <TextareaField
              id="content"
              rows={4}
              className="hidden"
              placeholder={t("admin.questions.answers.form.contentPlaceholder")}
              register={register("content")}
              error={errors.content}
              required
              disabled
            />
            <div className="flex items-center gap-2">
              {(!isViewMode || isEditMode) && (
                <Button variant="outline" onClick={handleEditContent}>
                  <Pencil className="h-4 w-4 text-green-500 dark:text-green-400" />
                  {t("common.edit")}
                </Button>
              )}
              <Button variant="outline" onClick={handlePreviewContent}>
                <Eye className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                {t("common.preview")}
              </Button>
            </div>
            {errors.content && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Is Correct Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-green-500 dark:text-green-400" />
              <Label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.questions.answers.columns.isCorrect")}
              </Label>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Controller
                name="isCorrect"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isCorrect"
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    disabled={loading || isSubmitting || isDisabled}
                  />
                )}
              />
              <Label
                htmlFor="isCorrect"
                className="text-sm text-muted-foreground"
              >
                {t("admin.questions.answers.isCorrectLabel")}
              </Label>
            </div>
          </div>

          {/* Explanation Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              <Label
                htmlFor="explanation"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                {t("admin.questions.answers.columns.explanation")}
              </Label>
            </div>
            <TextareaField
              id="explanation"
              rows={3}
              className="hidden"
              placeholder={t(
                "admin.questions.answers.form.explanationPlaceholder"
              )}
              register={register("explanation")}
              error={errors.explanation}
              disabled
            />
            <div className="flex items-center gap-2">
              {(!isViewMode || isEditMode) && (
                <Button variant="outline" onClick={handleEditExplanation}>
                  <Pencil className="h-4 w-4 text-green-500 dark:text-green-400" />
                  {t("common.edit")}
                </Button>
              )}
              <Button variant="outline" onClick={handlePreviewExplanation}>
                <Eye className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                {t("common.preview")}
              </Button>
            </div>
            {errors.explanation && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.explanation.message}
              </p>
            )}
          </div>
        </Form>
      </FormProvider>
    </FormDialog>
  );
}
