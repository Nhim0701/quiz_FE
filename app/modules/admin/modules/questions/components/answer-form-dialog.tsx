import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, type TypedTFunction } from "@/i18n";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/common/form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useApp } from "@/hooks";
import type { AnswerProps } from "../types";
import { useAnswerStore } from "../hooks";
import {
  Loader2,
  FileText,
  CheckSquare,
  MessageSquare,
  Square,
  Save,
  X,
  Edit,
} from "lucide-react";
import { answerSchema, type AnswerFormData } from "../schemas/anwser-schema";
import { cn } from "@/lib";

interface AnswerDialogProps {
  answer: AnswerProps | null;
  questionId: string;
  isOpen: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export function AnswerFormDialog({
  answer,
  questionId,
  isOpen,
  isEditMode,
  onClose,
  onEdit,
}: AnswerDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, showError, showDialog, closeDialog } = useApp();
  const { createAnswer, updateAnswer, deleteAnswer, loading } =
    useAnswerStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema(t)),
    defaultValues: {
      content: "",
      isCorrect: false,
      explanation: "",
    },
  });

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

  const onSubmit = async (data: AnswerFormData) => {
    if (!isEditMode) {
      return;
    }

    try {
      setIsSubmitting(true);
      if (answer) {
        // Update answer
        await updateAnswer(answer.id, {
          content: data.content,
          isCorrect: data.isCorrect || false,
          explanation: data.explanation || "",
        });
        showSuccess(t("admin.questions.answers.updateSuccess"));
      } else {
        // Create answer
        await createAnswer(questionId, {
          content: data.content,
          isCorrect: data.isCorrect || false,
          explanation: data.explanation || "",
        });
        showSuccess(t("admin.questions.answers.createSuccess"));
      }
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!answer) return;

    const confirmDelete = async () => {
      try {
        setIsSubmitting(true);
        await deleteAnswer(answer.id);
        showSuccess(t("admin.questions.answers.deleteSuccess"));
        closeDialog();
        onClose();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    };

    showDialog({
      title: t("admin.questions.answers.delete"),
      content: (
        <div className="py-4">
          <p>{t("admin.questions.answers.confirmDelete")}</p>
        </div>
      ),
      footer: (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeDialog}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={loading || isSubmitting}
          >
            {(loading || isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("admin.questions.answers.delete")}
          </Button>
        </div>
      ),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("admin.questions.answers.editTitle")
              : t("admin.questions.answers.viewTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("admin.questions.answers.editDescription")
              : t("admin.questions.answers.viewDescription")}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditMode) {
              handleSubmit(onSubmit)(e);
            }
          }}
          className="mt-6 space-y-4"
          noValidate
        >
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
            {isEditMode ? (
              <TextareaField
                id="content"
                label=""
                rows={4}
                placeholder={t(
                  "admin.questions.answers.form.contentPlaceholder"
                )}
                register={register("content")}
                error={errors.content}
                disabled={loading || isSubmitting}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {answer?.content || "-"}
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
            {isEditMode ? (
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
                      disabled={loading || isSubmitting}
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
            ) : (
              <div className="flex items-center gap-2">
                {answer?.isCorrect ? (
                  <>
                    <CheckSquare className="h-4 w-4 text-green-500 dark:text-green-400" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {t("admin.questions.answers.isCorrect")}
                    </span>
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("admin.questions.answers.isIncorrect")}
                    </span>
                  </>
                )}
              </div>
            )}
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
            {isEditMode ? (
              <TextareaField
                id="explanation"
                label=""
                rows={3}
                placeholder={t(
                  "admin.questions.answers.form.explanationPlaceholder"
                )}
                register={register("explanation")}
                error={errors.explanation}
                disabled={loading || isSubmitting}
                className={cn(
                  "min-h-[350px]",
                  answer?.explanation && "min-h-[350px]"
                )}
              />
            ) : (
              <p
                className={cn(
                  "text-sm text-muted-foreground",
                  answer?.explanation && "min-h-[350px]"
                )}
              >
                {answer?.explanation || "-"}
              </p>
            )}
          </div>

          <DialogFooter>
            {isEditMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={loading || isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  {t("common.cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  size="sm"
                  disabled={loading || isSubmitting}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                >
                  {(loading || isSubmitting) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  {t("common.save")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  {t("common.close")}
                </Button>
                {onEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="border-emerald-500/50 text-emerald-600 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-green-600 hover:text-white hover:border-emerald-600 dark:border-emerald-400/50 dark:text-emerald-400 dark:hover:from-emerald-600 dark:hover:to-green-700 dark:hover:border-emerald-500"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {t("common.edit")}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading || isSubmitting}
                >
                  {(loading || isSubmitting) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("admin.questions.answers.delete")}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
