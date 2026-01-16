import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, t } from "@/i18n";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { RESOURCES } from "@/modules/admin/constants/permissions";
import { ROUTES } from "../constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TextareaField, ComboboxField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { questionSchema, type QuestionFormData } from "../schemas";
import {
  Edit,
  Trash2,
  FileText,
  BookOpen,
  Folder,
  CheckSquare,
  Save,
  X,
  Loader2,
  Check,
  CheckCheck,
  Eye,
  PencilIcon,
} from "lucide-react";
import type { QuestionProps } from "../types";
import { useQuestionsStore } from "../hooks";
import { useTestsStore } from "../../tests/hooks";
import { useCategoriesStore } from "../../categories/hooks";
import { useApp, useEditorStore } from "@/hooks";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants/app";

// Helper function to find test by name
const findTestByName = (
  tests: Array<{ id: string; name: string; categoryId?: string }>,
  testName: string
): { id: string; name: string; categoryId?: string } | undefined => {
  return tests.find((t) => t.name === testName);
};

// Helper function to get error message
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  return error instanceof Error ? error.message : defaultMessage;
};

export function QuestionCard() {
  const { t } = useTranslation();
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { getNamespaceRoles } = useRole();
  const { showError, showSuccess, showDialog, closeDialog } = useApp();
  const { getQuestion, deleteQuestion, updateQuestion, loading } =
    useQuestionsStore();
  const { tests, fetchTests } = useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [question, setQuestion] = useState<QuestionProps | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const isLoadingRef = useRef(false);
  const { open: openEditor } = useEditorStore();

  const roles = getNamespaceRoles(RESOURCES.QUESTION);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema(t)),
    defaultValues: {
      content: "",
      testId: "",
      categoryId: "",
      isMultipleChoice: false,
    },
  });

  const watchedTestId = watch("testId");

  // Fetch tests and categories when entering edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const loadData = async () => {
      try {
        await Promise.all([
          fetchTests(1, MAX_PAGE_SIZE_FOR_ALL),
          fetchCategories(1, MAX_PAGE_SIZE_FOR_ALL),
        ]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  // Test options for combobox
  const testOptions = useMemo(() => {
    if (!tests || tests.length === 0) {
      return [];
    }
    return tests.map(
      (test: { id: string; name: string; categoryId?: string }) => ({
        value: test.id,
        label: test.name,
      })
    );
  }, [tests]);

  // Get category name from selected test
  const selectedCategory = useMemo(() => {
    if (!watchedTestId || !tests || tests.length === 0) {
      return "";
    }
    const test = tests.find(
      (t: { id: string; categoryId?: string }) => t.id === watchedTestId
    );
    if (!test || !test.categoryId) {
      return "";
    }
    const category = categories.find((c) => c.id === test.categoryId);
    return category?.name || "";
  }, [watchedTestId, tests, categories]);

  // Update categoryId when form testId changes
  useEffect(() => {
    if (!watchedTestId) {
      setValue("categoryId", "");
      return;
    }

    const selectedTest = tests.find(
      (t: { id: string; categoryId?: string }) => t.id === watchedTestId
    );
    setValue("categoryId", selectedTest?.categoryId || "");
  }, [watchedTestId, tests, setValue]);

  // Load question on mount
  useEffect(() => {
    if (!questionId) return;
    if (isLoadingRef.current) return; // Prevent multiple simultaneous calls

    const loadQuestion = async () => {
      isLoadingRef.current = true;
      try {
        // Fetch tests and categories first to find testId from test name
        await Promise.all([
          fetchTests(1, MAX_PAGE_SIZE_FOR_ALL),
          fetchCategories(1, MAX_PAGE_SIZE_FOR_ALL),
        ]);

        // Get fresh tests from store after fetch
        const store = useTestsStore.getState();
        const testsList = store.tests;

        // getQuestion requires testId but we can pass empty string as it's not used in the endpoint
        const questionData = await getQuestion("", questionId);
        setQuestion(questionData);

        // Reset form with question data
        const foundTest = findTestByName(testsList, questionData.test);
        const testId = foundTest?.id || "";
        const categoryId = foundTest?.categoryId || "";

        reset({
          content: questionData.content || "",
          testId,
          categoryId,
          isMultipleChoice: questionData.isMultipleChoice || false,
        });
      } catch (error) {
        showError(getErrorMessage(error, t("admin.questions.notFound")));
        navigate(ROUTES.INDEX);
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const handleEdit = useCallback(() => {
    if (!question) return;
    setIsEditMode(true);
  }, [question]);

  const handleCancel = useCallback(() => {
    setIsEditMode(false);
    if (question) {
      const foundTest = findTestByName(tests, question.test);
      const testId = foundTest?.id || "";
      const categoryId = foundTest?.categoryId || "";

      reset({
        content: question.content || "",
        testId,
        categoryId,
        isMultipleChoice: question.isMultipleChoice || false,
      });
    }
  }, [question, tests, reset]);

  const onSubmit = useCallback(
    async (data: QuestionFormData) => {
      if (!question || !isEditMode || !questionId) {
        return;
      }

      try {
        await updateQuestion(data.testId, question.id, {
          content: data.content,
          isMultipleChoice: data.isMultipleChoice || false,
          testId: data.testId,
          categoryId: data.categoryId,
        });
        showSuccess(t("admin.questions.updateSuccess"));
        setIsEditMode(false);

        // Reload question data
        await Promise.all([
          fetchTests(1, MAX_PAGE_SIZE_FOR_ALL),
          fetchCategories(1, MAX_PAGE_SIZE_FOR_ALL),
        ]);

        // Get fresh tests from store after fetch
        const store = useTestsStore.getState();
        const testsList = store.tests;

        const questionData = await getQuestion("", questionId);
        setQuestion(questionData);

        // Reset form with updated data
        const foundTest = findTestByName(testsList, questionData.test);
        const testId = foundTest?.id || "";
        const categoryId = foundTest?.categoryId || "";

        reset({
          content: questionData.content || "",
          testId,
          categoryId,
          isMultipleChoice: questionData.isMultipleChoice || false,
        });
      } catch (error) {
        showError(getErrorMessage(error, t("errors.genericError")));
      }
    },
    [
      question,
      isEditMode,
      questionId,
      updateQuestion,
      showSuccess,
      t,
      fetchTests,
      fetchCategories,
      getQuestion,
      reset,
      showError,
    ]
  );

  const handleDelete = useCallback(() => {
    if (!question) return;

    const confirmDelete = async () => {
      try {
        await deleteQuestion("", question.id);
        showSuccess(t("admin.questions.deleteSuccess"));
        navigate(ROUTES.INDEX);
        closeDialog();
      } catch (error) {
        showError(getErrorMessage(error, t("errors.genericError")));
      }
    };

    showDialog({
      title: t("admin.questions.delete"),
      content: (
        <div className="py-4">
          <p>{t("admin.questions.confirmDelete")}</p>
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
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("admin.questions.delete")}
          </Button>
        </div>
      ),
    });
  }, [
    question,
    deleteQuestion,
    showSuccess,
    t,
    navigate,
    closeDialog,
    showDialog,
    showError,
    loading,
  ]);

  const handlePreviewContent = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      openEditor({
        content: getValues("content") || "",
        mode: "html",
        title: `${t("common.preview")}: ${t("admin.questions.fields.content")}`,
      });
    },
    [question, t]
  );

  const handleEditContent = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      console.log("DEBUG: handleEditContent", question?.content || "");
      openEditor({
        content: question?.content || "",
        mode: "editor",
        title: `${t("common.edit")}: ${t("admin.questions.fields.content")}`,
        loadingLabel: t("common.saving"),
        callback: (content) => setValue("content", content),
      });
    },
    [question, t]
  );

  if (!question) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{t("admin.questions.generalInfo")}</CardTitle>
        <div className="flex gap-2">
          {roles.update && (
            <>
              {isEditMode ? (
                <>
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
                  <Button
                    onClick={handleCancel}
                    size="sm"
                    variant="outline"
                    disabled={loading || isSubmitting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t("common.cancel")}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEdit}
                  size="sm"
                  variant="outline"
                  className="border-emerald-500/50 text-emerald-600 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-green-600 hover:text-white hover:border-emerald-600 dark:border-emerald-400/50 dark:text-emerald-400 dark:hover:from-emerald-600 dark:hover:to-green-700 dark:hover:border-emerald-500"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t("common.edit")}
                </Button>
              )}
            </>
          )}
          {roles.delete && !isEditMode && (
            <Button
              onClick={handleDelete}
              size="sm"
              variant="destructive"
              disabled={loading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("admin.questions.delete")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          id="question-edit-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditMode) {
              handleSubmit(onSubmit)(e);
            }
          }}
          noValidate
        >
          {/* Content */}
          <div className="space-y-2 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.questions.fields.content")}
                <span className="text-red-500 dark:text-red-400 ml-1">*</span>
              </span>
            </div>

            {isEditMode && (
              <>
                <TextareaField
                  id="content"
                  label=""
                  rows={4}
                  placeholder={t("admin.questions.form.contentPlaceholder")}
                  register={register("content")}
                  error={errors.content}
                  disabled={loading || isSubmitting}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={handleEditContent}
                  className="mr-2"
                >
                  <PencilIcon className="h-4 w-4 text-green-500 dark:text-green-400" />
                  {t("common.edit")}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={handlePreviewContent}>
              <Eye className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              {t("common.preview")}
            </Button>
          </div>

          {/* Test */}
          <div className="space-y-2 py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.questions.filters.test")}
                <span className="text-red-500 dark:text-red-400 ml-1">*</span>
              </span>
            </div>
            {isEditMode ? (
              <ComboboxField
                id="testId"
                label=""
                name="testId"
                control={control}
                options={testOptions}
                error={errors.testId}
                disabled={loading || isSubmitting}
                placeholder={t("admin.questions.filters.testPlaceholder")}
                searchPlaceholder={t("admin.questions.filters.testSearch")}
                emptyMessage={t("admin.questions.filters.testEmpty")}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {question.test || "-"}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2 py-4">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-green-500 dark:text-green-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.questions.filters.category")}
                <span className="text-red-500 dark:text-red-400 ml-1">*</span>
              </span>
            </div>
            {isEditMode ? (
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      id="categoryId"
                      type="text"
                      value={selectedCategory || ""}
                      placeholder={t(
                        "admin.questions.filters.categoryPlaceholder"
                      )}
                      disabled={true}
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      readOnly
                    />
                    {errors.categoryId && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>
                )}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {question.category || "-"}
              </p>
            )}
          </div>

          {/* Multiple Choice */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.questions.columns.isMultipleChoice")}
              </span>
            </div>
            {isEditMode ? (
              <div className="flex items-center space-x-2 mt-2">
                <Controller
                  name="isMultipleChoice"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isMultipleChoice"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      disabled={loading || isSubmitting}
                    />
                  )}
                />
                <Label htmlFor="isMultipleChoice" className="text-sm">
                  {t("admin.questions.multipleChoice")}
                </Label>
              </div>
            ) : (
              <div>
                {question.isMultipleChoice ? (
                  <span className="text-sm text-blue-600 dark:text-blue-400 flex flex-row">
                    <CheckCheck className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />{" "}
                    {t("admin.questions.multipleChoice")}
                  </span>
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex flex-row">
                    <Check className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />{" "}
                    {t("admin.questions.singleChoice")}
                  </span>
                )}
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
