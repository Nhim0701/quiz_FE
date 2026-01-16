import { useMemo, useCallback } from "react";
import { useParams } from "react-router";
import { useTranslation } from "@/i18n";
import { type Column } from "@/components/common/data-table";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { RESOURCES } from "@/modules/admin/constants/permissions";
import { usePageData } from "@/hooks";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AnswerProps } from "../types";
import { AnswerFormDialog } from "./answer-form-dialog";
import { useAnswerStore } from "../hooks";
import { useAdminListActions } from "@/modules/admin/hooks";
import { AdminList } from "@/modules/admin/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DIALOG_MODES } from "@/constants";
import { extractContentFromHtml } from "@/lib/utils";

export function AnswerList() {
  const { t } = useTranslation();
  const { questionId } = useParams<{ questionId: string }>();
  const { getNamespaceRoles } = useRole();
  const { fetchAnswers, answers, loading, openDialog, refreshAnswers } =
    useAnswerStore();

  const roles = getNamespaceRoles(RESOURCES.QUESTION);

  usePageData(
    async () => {
      if (questionId) {
        await fetchAnswers(questionId);
      }
    },
    {
      errorKey: "errors.fetchDataFailed",
      showLoading: false,
      showError: false,
      onError: (error) => {
        console.error("Failed to fetch answers:", error);
      },
    }
  );

  const handleViewInfo = useCallback(
    (answer: AnswerProps) => {
      if (!questionId) return;
      openDialog(DIALOG_MODES.VIEW, questionId, answer);
    },
    [questionId, openDialog]
  );

  const handleEdit = useCallback(
    (answer: AnswerProps) => {
      if (!questionId) return;
      openDialog(DIALOG_MODES.EDIT, questionId, answer);
    },
    [questionId, openDialog]
  );

  const handleCreateAnswer = useCallback(() => {
    if (!questionId) return;
    openDialog(DIALOG_MODES.CREATE, questionId);
  }, [questionId, openDialog]);

  const handleRefresh = useCallback(async () => {
    if (questionId) {
      await refreshAnswers(questionId);
    }
  }, [questionId, refreshAnswers]);

  const handleDelete = useCallback(
    (answer: AnswerProps) => {
      if (!questionId) return;
      const { deleteAnswer: deleteAnswerFromStore } = useAnswerStore.getState();
      return deleteAnswerFromStore(answer.id, questionId);
    },
    [questionId]
  );

  const { actions } = useAdminListActions<AnswerProps>({
    roles,
    deleteFunction: async (id: string) => {
      if (!questionId) return;
      const { deleteAnswer } = useAnswerStore.getState();
      await deleteAnswer(id, questionId);
    },
    refreshFunction: async () => {
      if (questionId) {
        await refreshAnswers(questionId);
      }
    },
    successMessageKey: "admin.questions.answers.deleteSuccess",
    deleteTitleKey: "admin.questions.answers.delete",
    confirmDeleteKey: "admin.questions.answers.confirmDelete",
    deleteButtonKey: "admin.questions.answers.delete",
    onView: handleViewInfo,
    onEdit: handleEdit,
  });

  const columns = useMemo<Column<AnswerProps>[]>(
    () => [
      {
        key: "content",
        header: t("admin.questions.answers.columns.content"),
        className: "w-[400px]",
        render: (answer) => (
          <span className="font-medium line-clamp-2">
            {extractContentFromHtml(answer.content)}
          </span>
        ),
      },
      {
        key: "isCorrect",
        header: t("admin.questions.answers.columns.isCorrect"),
        meta: { center: true },
        render: (answer) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  {answer.isCorrect ? (
                    <CheckSquare className="h-5 w-5 text-green-500 dark:text-green-400" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {answer.isCorrect
                    ? t("admin.questions.answers.isCorrect")
                    : t("admin.questions.answers.isIncorrect")}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        key: "explanation",
        header: t("admin.questions.answers.columns.explanation"),
        render: (answer) => (
          <span className="text-muted-foreground">
            {extractContentFromHtml(answer.explanation || "-")}
          </span>
        ),
      },
    ],
    [t]
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
        <AdminList
          columns={columns}
          data={answers}
          actions={actions}
          loading={loading}
          emptyMessage={t("admin.questions.answers.empty")}
        />
        <AnswerFormDialog onDelete={handleDelete} onRefresh={handleRefresh} />
      </CardContent>
    </Card>
  );
}
