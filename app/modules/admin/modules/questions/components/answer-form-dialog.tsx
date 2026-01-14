import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, Controller, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { TextareaField } from "@/components/common/form-field";
import { Label } from "@/components/ui/label";
import { useApp } from "@/hooks";
import type { AnswerProps } from "../types";
import { useAnswerStore } from "../hooks";
import { FileText, CheckSquare, MessageSquare, Square } from "lucide-react";
import { answerSchema, type AnswerFormData } from "../schemas/anwser-schema";
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

interface AnswerDialogProps {
  answer: AnswerProps | null;
  questionId: string;
  isOpen: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

/**
 * AnswerFormDialog extends FormDialog to provide answer-specific form functionality.
 * It handles create, edit, and view modes for answers.
 * Mode is determined from props (answer and isEditMode).
 */
export function AnswerFormDialog({
  answer,
  questionId,
  isOpen,
  isEditMode,
  onClose,
  onEdit,
}: AnswerDialogProps) {
  const { t } = useTranslation();
  const {
    showError,
    showSuccess,
    showDialog,
    closeDialog: closeAppDialog,
  } = useApp();
  const { createAnswer, updateAnswer, deleteAnswer, loading } =
    useAnswerStore();

  const [isDeleting, setIsDeleting] = useState(false);

  // Determine mode based on answer and isEditMode
  const mode = useMemo<FormDialogMode>(() => {
    if (answer) {
      return isEditMode ? DIALOG_MODES.EDIT : DIALOG_MODES.VIEW;
    }
    return DIALOG_MODES.CREATE;
  }, [answer, isEditMode]);

  const methods = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema(t)),
    defaultValues: {
      content: "",
      isCorrect: false,
      explanation: "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = methods;

  const currentValues = watch();

  // Reset form when answer or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (answer) {
        reset({
          content: answer.content || "",
          isCorrect: answer.isCorrect || false,
          explanation: answer.explanation || "",
        });
      } else {
        reset({
          content: "",
          isCorrect: false,
          explanation: "",
        });
      }
    }
  }, [answer, reset, isOpen]);

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
    try {
      if (mode === DIALOG_MODES.CREATE) {
        await createAnswer(questionId, {
          content: data.content,
          isCorrect: data.isCorrect || false,
          explanation: data.explanation || "",
        });
        showSuccess(t("admin.questions.answers.createSuccess"));
        onClose();
      } else if (answer) {
        // Handle both VIEW (with edit mode) and EDIT modes
        await updateAnswer(answer.id, {
          content: data.content,
          isCorrect: data.isCorrect || false,
          explanation: data.explanation || "",
        });
        showSuccess(t("admin.questions.answers.updateSuccess"));
        onClose();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  const handleEdit = useCallback(() => {
    onEdit?.();
  }, [onEdit]);

  const handleCancel = useCallback(() => {
    if (isViewMode && isEditMode && answer) {
      reset({
        content: answer.content || "",
        isCorrect: answer.isCorrect || false,
        explanation: answer.explanation || "",
      });
    }
    onClose();
  }, [isViewMode, isEditMode, answer, reset, onClose]);

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleDeleteClick = useCallback(() => {
    if (!answer) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        await deleteAnswer(answer.id);
        showSuccess(t("admin.questions.answers.deleteSuccess"));
        closeAppDialog();
        onClose();
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
    t,
    showDialog,
    closeAppDialog,
    onClose,
    showError,
    showSuccess,
    deleteAnswer,
  ]);

  if (!isOpen) return null;

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      mode={mode}
      isEditMode={isEditMode}
      title={title}
      description={description}
      onEdit={handleEdit}
      onDelete={answer ? handleDeleteClick : undefined}
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
              placeholder={t("admin.questions.answers.form.contentPlaceholder")}
              register={register("content")}
              error={errors.content}
              required
              disabled={loading || isSubmitting || isDisabled}
            />
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
              placeholder={t(
                "admin.questions.answers.form.explanationPlaceholder"
              )}
              register={register("explanation")}
              error={errors.explanation}
              disabled={loading || isSubmitting || isDisabled}
            />
          </div>
        </Form>
      </FormProvider>
    </FormDialog>
  );
}
