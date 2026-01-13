import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { RESOURCES } from "@/modules/admin/constants/permissions";
import { ROUTES as ADMIN_ROUTES } from "@/constants";
import { ROUTES } from "../../constants";
import { useBreadcrumb, useApp } from "@/hooks";
import { useTestsStore, useQuestionStore } from "../../hooks";
import { questionSchema, type QuestionFormData } from "../../schemas";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { EditorContainer, Editor } from "@/components/ui/editor";
import { ArrowLeft, Loader2, FileText, CheckSquare, Save } from "lucide-react";
import { cn } from "@/lib";

export default function AdminQuestionForm() {
  const { t } = useTranslation();
  const { testId, questionId } = useParams<{
    testId: string;
    questionId?: string;
  }>();
  const navigate = useNavigate();
  const { getNamespaceRoles } = useRole();
  const { showSuccess, showError } = useApp();
  const { getTestById } = useTestsStore();
  const { createQuestion, updateQuestion, getQuestion, loading } =
    useQuestionStore();

  const roles = getNamespaceRoles(RESOURCES.QUESTION);
  const isEditMode = !!questionId;

  const [test, setTest] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testLoading, setTestLoading] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema(t)),
    defaultValues: {
      content: "",
      isMultipleChoice: false,
    },
  });

  // Load test data
  useEffect(() => {
    const loadTest = async () => {
      if (!testId) return;
      try {
        setTestLoading(true);
        const testData = await getTestById(testId);
        if (testData) {
          setTest(testData);
        }
      } catch (error) {
        showError(t("admin.tests.info.notFound"));
        navigate(ROUTES.TESTS.INDEX);
      } finally {
        setTestLoading(false);
      }
    };
    loadTest();
  }, [testId, getTestById, showError, t, navigate]);

  // Load question data for edit mode
  useEffect(() => {
    const loadQuestion = async () => {
      if (!isEditMode || !testId || !questionId) return;
      try {
        const question = await getQuestion(testId, questionId);
        reset({
          content: question.content || "",
          isMultipleChoice: question.isMultipleChoice || false,
        });
      } catch (error) {
        showError(t("admin.tests.questions.notFound"));
        navigate(ROUTES.TESTS.INFO(testId));
      }
    };
    loadQuestion();
  }, [
    isEditMode,
    testId,
    questionId,
    getQuestion,
    reset,
    showError,
    t,
    navigate,
  ]);

  // Set breadcrumbs
  useBreadcrumb(
    [
      {
        label: t("sidebar.admin.index"),
        href: "",
      },
      {
        label: t("sidebar.admin.tests"),
        href: ROUTES.TESTS.INDEX,
      },
      {
        label: test?.name || t("admin.tests.info.title"),
        href: testId ? ROUTES.TESTS.INFO(testId) : ROUTES.TESTS.INDEX,
      },
      {
        label: isEditMode
          ? t("admin.tests.questions.edit")
          : t("admin.tests.questions.create"),
        href: questionId
          ? testId && questionId
            ? ROUTES.TESTS.QUESTIONS.EDIT(testId, questionId)
            : ""
          : testId
            ? ROUTES.TESTS.QUESTIONS.NEW(testId)
            : "",
      },
    ],
    [test, testId, questionId, isEditMode, t]
  );

  const onSubmit = async (data: QuestionFormData) => {
    if (!testId) return;

    setIsSubmitting(true);
    try {
      const questionData = {
        content: data.content,
        isMultipleChoice: data.isMultipleChoice ?? false,
      };
      if (isEditMode && questionId) {
        await updateQuestion(testId, questionId, questionData);
        showSuccess(t("admin.tests.questions.updateSuccess"));
      } else {
        await createQuestion(testId, questionData);
        showSuccess(t("admin.tests.questions.createSuccess"));
      }
      navigate(ROUTES.TESTS.INFO(testId));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (testId) {
      navigate(ROUTES.TESTS.INFO(testId));
    }
  };

  if (!roles.create && !isEditMode) {
    return (
      <Container>
        <PageHeader
          title={
            isEditMode
              ? t("admin.tests.questions.edit")
              : t("admin.tests.questions.create")
          }
        />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {t("admin.tests.questions.noPermission")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!roles.update && isEditMode) {
    return (
      <Container>
        <PageHeader title={t("admin.tests.questions.edit")} />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {t("admin.tests.questions.noPermission")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (testLoading) {
    return (
      <Container>
        <PageHeader
          title={
            isEditMode
              ? t("admin.tests.questions.edit")
              : t("admin.tests.questions.create")
          }
        />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="p-2">
      <PageHeader
        title={
          isEditMode
            ? t("admin.tests.questions.edit")
            : t("admin.tests.questions.create")
        }
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            {isEditMode
              ? t("admin.tests.questions.editTitle")
              : t("admin.tests.questions.createTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Content Field */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("admin.tests.questions.fields.content")}
                <span className="text-red-500 dark:text-red-400 ml-1">*</span>
              </Label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <div>
                    <EditorContainer
                      variant="select"
                      className={cn(
                        "min-h-[200px] border border-input rounded-md",
                        errors.content &&
                          "border-red-500 dark:border-red-600 ring-1 ring-red-500 dark:ring-red-600"
                      )}
                    >
                      <Editor
                        placeholder={t(
                          "admin.tests.questions.form.contentPlaceholder"
                        )}
                        value={field.value}
                        onChange={field.onChange}
                        variant="select"
                        disabled={isSubmitting}
                      />
                    </EditorContainer>
                    {errors.content && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.content.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Type Field (Checkbox) */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("admin.tests.questions.fields.type")}
              </Label>
              <Controller
                name="isMultipleChoice"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isMultipleChoice"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                      className="border-2 border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                    />
                    <Label
                      htmlFor="isMultipleChoice"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      <CheckSquare className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      {t("admin.tests.questions.multipleChoice")}
                    </Label>
                  </div>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t("common.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
