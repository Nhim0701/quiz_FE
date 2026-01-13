import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  FormField,
  TextareaField,
  ComboboxField,
} from "@/components/common/form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useApp, usePaginationStore, FilterManager } from "@/hooks";
import { testSchema, type TestFormData } from "../schemas";
import { useTestsStore } from "../hooks";
import { useCategoriesStore } from "../../categories/hooks";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants";

interface TestFormProps {
  onClearFilters?: (() => void) | null;
}

export function TestForm({ onClearFilters }: TestFormProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const { page, pageSize } = usePaginationStore();
  const [searchParams] = useSearchParams();
  const {
    isDialogOpen,
    editingTest,
    viewingTest,
    closeDialog,
    createTest,
    updateTest,
    refreshTests,
    adminLoading: loading,
  } = useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const isEditMode = !!editingTest;

  // Only show this dialog when not viewing (i.e., creating or editing from create button)
  const shouldShow = isDialogOpen && !viewingTest;

  // Convert categories to combobox options
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TestFormData>({
    resolver: zodResolver(testSchema(t)),
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      timeLimit: undefined,
    },
  });

  useEffect(() => {
    if (shouldShow) {
      if (editingTest) {
        reset({
          name: editingTest.name || "",
          categoryId: editingTest.categoryId || "",
          description: editingTest.description || "",
          timeLimit: editingTest.timeLimit,
        });
      } else {
        reset({
          name: "",
          categoryId: "",
          description: "",
          timeLimit: undefined,
        });
      }
      // Fetch categories when form opens
      fetchCategories(1, MAX_PAGE_SIZE_FOR_ALL).catch((error) => {
        console.error("Failed to fetch categories:", error);
      });
    }
  }, [shouldShow, editingTest, reset, fetchCategories]);

  const onSubmit = async (data: TestFormData) => {
    try {
      if (isEditMode && editingTest) {
        await updateTest(editingTest.id, data);
        showSuccess(t("admin.tests.updateSuccess"));
        closeDialog();
        // Get current filters from URL and apply them
        const urlFilters = FilterManager.extractFiltersFromUrl(searchParams);
        const apiFilters = FilterManager.convertFiltersToApiParams(urlFilters);
        await refreshTests(page, pageSize, apiFilters);
      } else {
        await createTest(data);
        showSuccess(t("admin.tests.createSuccess"));
        closeDialog();
        // Clear filters and fetch all data after create
        if (onClearFilters) {
          onClearFilters();
        }
        await refreshTests(1, pageSize);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  return (
    <Dialog open={shouldShow} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("admin.tests.editTitle")
              : t("admin.tests.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("admin.tests.editDescription")
              : t("admin.tests.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField
            id="name"
            label={t("admin.tests.form.nameLabel")}
            type="text"
            placeholder={t("admin.tests.form.namePlaceholder")}
            register={register("name")}
            error={errors.name}
            required
            disabled={loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />

          <ComboboxField
            id="categoryId"
            label={t("admin.tests.form.categoryLabel")}
            name="categoryId"
            control={control}
            options={categoryOptions}
            error={errors.categoryId}
            required
            disabled={loading || isSubmitting}
            placeholder={t("admin.tests.form.selectCategory")}
            searchPlaceholder={t("admin.tests.form.searchCategory")}
            emptyMessage={t("admin.tests.form.noCategoryFound")}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />

          <TextareaField
            id="description"
            label={t("admin.tests.form.descriptionLabel")}
            rows={4}
            placeholder={t("admin.tests.form.descriptionPlaceholder")}
            register={register("description")}
            error={errors.description}
            disabled={loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
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
            disabled={loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />

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
              {isEditMode ? t("admin.tests.update") : t("admin.tests.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
