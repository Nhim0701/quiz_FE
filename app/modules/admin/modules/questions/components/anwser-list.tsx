import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams } from "react-router";
import { useTranslation } from "@/i18n";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { RESOURCES } from "@/modules/admin/constants/permissions";
import { useApp } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Edit,
  Trash2,
  FileText,
  CheckSquare,
  Square,
  Plus,
} from "lucide-react";
import {
  DataTable,
  type Column,
  type Action,
} from "@/components/common/data-table";
import type { AnswerProps } from "../types";
import { AnswerFormDialog as AnswerDialog } from "./answer-form-dialog";
import { useAnswerStore } from "../hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Helper function to get error message
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  return error instanceof Error ? error.message : defaultMessage;
};

export function AnswerList() {
  const { t } = useTranslation();
  const { questionId } = useParams<{ questionId: string }>();
  const { getNamespaceRoles } = useRole();
  const { showError, showSuccess, showDialog, closeDialog } = useApp();
  const {
    fetchAnswers,
    deleteAnswer,
    answers,
    loading: answerLoading,
  } = useAnswerStore();
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerProps | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isLoadingRef = useRef(false);

  const roles = getNamespaceRoles(RESOURCES.QUESTION);

  const reloadAnswers = useCallback(async () => {
    if (!questionId) return;
    if (isLoadingRef.current) return; // Prevent multiple simultaneous calls

    isLoadingRef.current = true;
    try {
      await fetchAnswers(questionId);
    } catch (error) {
      showError(getErrorMessage(error, t("errors.genericError")));
    } finally {
      isLoadingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  // Fetch answers on mount and when questionId changes
  useEffect(() => {
    if (!questionId) return;
    if (isLoadingRef.current) return; // Prevent multiple simultaneous calls

    const loadAnswers = async () => {
      isLoadingRef.current = true;
      try {
        setIsLoadingAnswers(true);
        await fetchAnswers(questionId);
      } catch (error) {
        showError(getErrorMessage(error, t("errors.genericError")));
      } finally {
        setIsLoadingAnswers(false);
        isLoadingRef.current = false;
      }
    };
    loadAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const handleViewInfo = useCallback((answer: AnswerProps) => {
    setSelectedAnswer(answer);
    setIsEditMode(false);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((answer: AnswerProps) => {
    setSelectedAnswer(answer);
    setIsEditMode(true);
    setIsDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedAnswer(null);
    setIsEditMode(true);
    setIsDialogOpen(true);
  }, []);

  const handleCreateAnswer = useCallback(() => {
    handleCreate();
  }, [handleCreate]);

  const handleEditFromView = useCallback(() => {
    if (selectedAnswer) {
      setIsEditMode(true);
    }
  }, [selectedAnswer]);

  const handleDialogClose = useCallback(async () => {
    setIsDialogOpen(false);
    setSelectedAnswer(null);
    setIsEditMode(false);
    await reloadAnswers();
  }, [reloadAnswers]);

  const handleDelete = useCallback(
    (answer: AnswerProps) => {
      const confirmDelete = async () => {
        try {
          await deleteAnswer(answer.id);
          showSuccess(t("admin.questions.answers.deleteSuccess"));
          closeDialog();
          await reloadAnswers();
        } catch (error) {
          showError(getErrorMessage(error, t("errors.genericError")));
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
              disabled={answerLoading}
            >
              {answerLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("admin.questions.answers.delete")}
            </Button>
          </div>
        ),
      });
    },
    [
      deleteAnswer,
      showSuccess,
      t,
      closeDialog,
      reloadAnswers,
      showError,
      showDialog,
      answerLoading,
    ]
  );

  const columns: Column<AnswerProps>[] = useMemo(
    () => [
      {
        key: "content",
        header: t("admin.questions.answers.columns.content"),
        className: "w-[400px]",
        render: (answer) => (
          <span className="font-medium line-clamp-2">{answer.content}</span>
        ),
      },
      {
        key: "isCorrect",
        header: t("admin.questions.answers.columns.isCorrect"),
        meta: { center: true },
        render: (answer) => (
          <div className="flex items-center justify-center">
            {answer.isCorrect ? (
              <CheckSquare className="h-5 w-5 text-green-500 dark:text-green-400" />
            ) : (
              <Square className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        ),
      },
      {
        key: "explanation",
        header: t("admin.questions.answers.columns.explanation"),
        render: (answer) => (
          <span className="text-muted-foreground">
            {answer.explanation || "-"}
          </span>
        ),
      },
    ],
    [t]
  );

  const actions: Action<AnswerProps>[] = useMemo(
    () => [
      ...(roles.read
        ? [
            {
              label: t("common.viewInfo"),
              onClick: handleViewInfo,
              icon: <FileText className="h-4 w-4" />,
              actionType: "viewInfo" as const,
            },
          ]
        : []),
      ...(roles.update
        ? [
            {
              label: t("common.edit"),
              onClick: handleEdit,
              icon: <Edit className="h-4 w-4" />,
              actionType: "edit" as const,
            },
          ]
        : []),
      ...(roles.delete
        ? [
            {
              label: t("admin.questions.answers.delete"),
              onClick: handleDelete,
              variant: "destructive" as const,
              icon: <Trash2 className="h-4 w-4" />,
              actionType: "delete" as const,
            },
          ]
        : []),
    ],
    [roles, t, handleViewInfo, handleEdit, handleDelete]
  );

  if (!questionId) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{t("admin.questions.answersList")}</CardTitle>
        {roles.create && (
          <Button
            onClick={handleCreateAnswer}
            size="sm"
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("admin.questions.answers.create")}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={answers}
          actions={actions}
          loading={isLoadingAnswers || answerLoading}
          emptyMessage={t("admin.questions.answers.empty")}
        />
        <AnswerDialog
          answer={selectedAnswer}
          questionId={questionId}
          isOpen={isDialogOpen}
          isEditMode={isEditMode}
          onEdit={handleEditFromView}
          onClose={handleDialogClose}
        />
      </CardContent>
    </Card>
  );
}
