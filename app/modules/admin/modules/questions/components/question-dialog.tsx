import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextareaField, ComboboxField } from "@/components/common/form-field";
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
import { useApp, usePaginationStore } from "@/hooks";
import { questionSchema, type QuestionFormData } from "../schemas";
import { useQuestionsStore } from "../hooks";
import { useTestsStore } from "../../tests/hooks";
import { useCategoriesStore } from "../../categories/hooks";
import { Loader2, FileText, BookOpen, Folder, CheckSquare } from "lucide-react";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants/app";

export function QuestionDialog() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const { page, pageSize } = usePaginationStore();
  const { isDialogOpen, closeDialog, createQuestion, fetchQuestions, loading } =
    useQuestionsStore();
  const { adminTests: tests, fetchTests } = useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  const [selectedTestId, setSelectedTestId] = useState<string>("");

  // Fetch tests and categories when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
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
    }
  }, [isDialogOpen, fetchTests, fetchCategories]);

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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
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

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isDialogOpen) {
      reset({
        content: "",
        testId: "",
        categoryId: "",
        isMultipleChoice: false,
      });
      setSelectedTestId("");
    }
  }, [isDialogOpen, reset]);

  const onSubmit = async (data: QuestionFormData) => {
    try {
      await createQuestion({
        testId: data.testId,
        content: data.content,
        isMultipleChoice: data.isMultipleChoice || false,
        categoryId: data.categoryId,
      });
      showSuccess(t("admin.questions.createSuccess"));
      closeDialog();
      // Refresh questions list
      await fetchQuestions(page, pageSize);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("admin.questions.createTitle")}</DialogTitle>
          <DialogDescription>
            {t("admin.questions.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Content Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <Label
                htmlFor="content"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                {t("admin.questions.fields.content")}
                <span className="text-red-500 dark:text-red-400 ml-1">*</span>
              </Label>
            </div>
            <TextareaField
              id="content"
              label=""
              rows={4}
              placeholder={t("admin.questions.form.contentPlaceholder")}
              register={register("content")}
              error={errors.content}
              disabled={loading || isSubmitting}
              className="mt-0"
            />
          </div>

          {/* Test Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              <Label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.questions.filters.test")}
                <span className="text-red-500 dark:text-red-400 ml-1">*</span>
              </Label>
            </div>
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
              className="mt-0"
            />
          </div>

          {/* Category Field (Disabled) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-green-500 dark:text-green-400" />
              <Label
                htmlFor="categoryId"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                {t("admin.questions.filters.category")}
                <span className="text-red-500 dark:text-red-400 ml-1">*</span>
              </Label>
            </div>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    id="categoryId"
                    name={field.name}
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
          </div>

          {/* Multiple Choice Checkbox */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
              <Label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.questions.columns.isMultipleChoice")}
              </Label>
            </div>
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
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeDialog}
              disabled={loading || isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              {(loading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("admin.questions.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
