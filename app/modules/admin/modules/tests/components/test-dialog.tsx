import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useApp, usePaginationStore } from "@/hooks";
import { testSchema, type TestFormData } from "../schemas";
import { useTestsStore, type TestProps } from "../hooks";
import { useCategoriesStore } from "../../categories/hooks";
import { Loader2, Edit, Trash2, Save, X } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
} from "@/components/ui/alert-dialog";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants";

interface TestViewDialogProps {
  test: TestProps | null;
  onDelete: (test: TestProps) => void;
}

export function TestViewDialog({ test, onDelete }: TestViewDialogProps) {
  const { t } = useTranslation();
  const {
    showError,
    showSuccess,
    showDialog,
    closeDialog: closeAppDialog,
  } = useApp();
  const { page, pageSize } = usePaginationStore();
  const {
    isDialogOpen,
    viewingTest,
    isEditMode,
    closeDialog,
    updateTest,
    refreshTests,
    adminLoading: loading,
    setEditMode,
  } = useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [isDeleting, setIsDeleting] = useState(false);

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
    watch,
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
    if (viewingTest) {
      reset({
        name: viewingTest.name || "",
        categoryId: viewingTest.categoryId || "",
        description: viewingTest.description || "",
        timeLimit: viewingTest.timeLimit,
      });
      // Fetch categories when dialog opens
      fetchCategories(1, MAX_PAGE_SIZE_FOR_ALL).catch((error) => {
        console.error("Failed to fetch categories:", error);
      });
    }
  }, [viewingTest, reset, fetchCategories, isDialogOpen]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (viewingTest) {
      reset({
        name: viewingTest.name || "",
        categoryId: viewingTest.categoryId || "",
        description: viewingTest.description || "",
        timeLimit: viewingTest.timeLimit,
      });
    }
  };

  const onSubmit = async (data: TestFormData) => {
    if (!viewingTest) return;

    try {
      await updateTest(viewingTest.id, data);
      showSuccess(t("admin.tests.updateSuccess"));
      setEditMode(false);
      await refreshTests(page, pageSize);
      // Form will be updated via useEffect when viewingTest changes
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  const handleDeleteClick = () => {
    if (!viewingTest) return;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        onDelete(viewingTest);
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
      title: t("admin.tests.delete"),
      content: (
        <AlertDialogDescription>
          {(
            t as (
              key: string,
              params?: Record<string, string | number>
            ) => string
          )("admin.tests.confirmDelete", { name: viewingTest.name })}
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
            {t("admin.tests.delete")}
          </AlertDialogAction>
        </AlertDialogFooterComponent>
      ),
    });
  };

  if (!viewingTest || !isDialogOpen) return null;

  const currentValues = watch();
  const hasChanges =
    currentValues.name !== viewingTest.name ||
    currentValues.categoryId !== viewingTest.categoryId ||
    currentValues.description !== (viewingTest.description || "") ||
    currentValues.timeLimit !== viewingTest.timeLimit;

  return (
    <Dialog
      open={isDialogOpen && !!viewingTest}
      onOpenChange={(open) => !open && closeDialog()}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("admin.tests.viewTitle")}</DialogTitle>
          <DialogDescription>
            {t("admin.tests.viewDescription")}
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
            disabled={!isEditMode || loading || isSubmitting}
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
            disabled={!isEditMode || loading || isSubmitting}
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
            disabled={!isEditMode || loading || isSubmitting}
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
            disabled={!isEditMode || loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />

          <DialogFooter>
            {!isEditMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium border-0"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t("common.edit")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteClick}
                  disabled={loading || isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("admin.tests.delete")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading || isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || isSubmitting || !hasChanges}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                >
                  {(loading || isSubmitting) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  {t("common.save")}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
