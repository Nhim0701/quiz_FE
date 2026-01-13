import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { RESOURCES } from "@/constants/permissions";
import { ROUTES } from "@/constants";
import { useTestsStore, type TestProps } from "../hooks";
import { useCategoriesStore } from "../../categories/hooks";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/ui/loading";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FileText,
  FolderTree,
  Clock,
  Hash,
  Calendar,
  ArrowLeft,
  List,
  Pencil,
  Check,
  ChevronsUpDown,
  X,
  Loader2,
} from "lucide-react";
import { formatUnixTimestamp, cn } from "@/lib";
import { useApp, useBreadcrumb } from "@/hooks";
import { PageHeader } from "@/components/page-header";
import { testSchema, type TestFormData } from "../schemas";

export default function AdminTestInfo() {
  const { t } = useTranslation();
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { getNamespaceRoles } = useRole();
  const { showSuccess, showError: showAppError } = useApp();

  const roles = getNamespaceRoles(RESOURCES.TEST);
  const { getTestById, updateTest } = useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  const [test, setTest] = useState<TestProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
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

  // Set breadcrumb
  useBreadcrumb(
    [
      {
        label: t("sidebar.admin.index"),
        href: ROUTES.ADMIN.INDEX,
      },
      {
        label: t("sidebar.admin.tests"),
        href: ROUTES.ADMIN.TESTS,
      },
      {
        label: test?.name || t("admin.tests.info.title"),
        href: testId ? ROUTES.ADMIN.TEST_INFO(testId) : ROUTES.ADMIN.TESTS,
      },
    ],
    [test, testId, t]
  );

  useEffect(() => {
    const loadTest = async () => {
      if (!testId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const testData = await getTestById(testId);
        if (!testData) {
          showAppError(t("admin.tests.info.notFound"));
          navigate(ROUTES.ADMIN.TESTS);
          return;
        }
        setTest(testData);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showAppError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId, getTestById, showAppError, t, navigate]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        await fetchCategories(1, 1000);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();
  }, [fetchCategories]);

  // Reset form when test data changes or entering edit mode
  useEffect(() => {
    if (test) {
      reset({
        name: test.name || "",
        categoryId: test.categoryId || "",
        description: test.description || "",
        timeLimit: test.timeLimit || undefined,
      });
    }
  }, [test, reset, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (test) {
      reset({
        name: test.name || "",
        categoryId: test.categoryId || "",
        description: test.description || "",
        timeLimit: test.timeLimit || undefined,
      });
    }
  };

  const onSubmit = async (data: TestFormData) => {
    if (!test) return;

    setIsSubmitting(true);
    try {
      await updateTest(test.id, data);
      showSuccess(t("admin.tests.updateSuccess"));
      setIsEditing(false);
      // Reload test data
      const updatedTest = await getTestById(testId!);
      if (updatedTest) {
        setTest(updatedTest);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showAppError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name])
  );

  const categoryName =
    test?.categoryName ||
    categoryMap.get(test?.categoryId || "") ||
    test?.categoryId ||
    "-";

  if (!roles.read) {
    return (
      <Container>
        <PageHeader title={t("admin.tests.info.title")} />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {t("admin.tests.noPermission")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (loading) {
    return <Loading message={t("admin.tests.info.loading")} />;
  }

  if (!test) {
    return (
      <Container>
        <PageHeader title={t("admin.tests.info.title")} />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {t("admin.tests.info.notFound")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="p-2">
      <PageHeader title={test.name || t("admin.tests.info.title")} />
      <div className="space-y-6">
        {/* Test Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                {t("admin.tests.info.cardTitle")}
              </div>
              {roles.update && (
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        {t("common.cancel")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {t("common.save")}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleEdit}
                      className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Pencil className="h-4 w-4" />
                      {t("admin.tests.edit")}
                    </Button>
                  )}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("admin.tests.info.fields.name")}
                    <span className="text-red-500 dark:text-red-400 ml-1">
                      *
                    </span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    {isEditing ? (
                      <div className="flex-1">
                        <Input
                          {...register("name")}
                          className={cn(
                            "text-sm",
                            errors.name &&
                              "border-red-500 dark:border-red-600 focus-visible:ring-red-500 dark:focus-visible:ring-red-600"
                          )}
                          disabled={isSubmitting}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {test.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* ID */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("admin.tests.info.fields.id")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {test.id}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("admin.tests.info.fields.category")}
                    <span className="text-red-500 dark:text-red-400 ml-1">
                      *
                    </span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    {isEditing ? (
                      <div className="flex-1">
                        <Controller
                          name="categoryId"
                          control={control}
                          render={({ field }) => (
                            <Popover
                              open={categoryOpen}
                              onOpenChange={setCategoryOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={categoryOpen}
                                  className={cn(
                                    "w-full justify-between text-sm h-9",
                                    !field.value && "text-muted-foreground",
                                    errors.categoryId &&
                                      "border-red-500 dark:border-red-600"
                                  )}
                                  disabled={isSubmitting}
                                >
                                  <span className="truncate flex-1 text-left">
                                    {field.value
                                      ? categories.find(
                                          (category) =>
                                            category.id === field.value
                                        )?.name ||
                                        t("admin.tests.form.selectCategory")
                                      : t("admin.tests.form.selectCategory")}
                                  </span>
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-full p-0"
                                align="start"
                              >
                                <Command>
                                  <CommandInput
                                    placeholder={t(
                                      "admin.tests.form.searchCategory"
                                    )}
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      {t("admin.tests.form.noCategoryFound")}
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {categories.map((category) => (
                                        <CommandItem
                                          key={category.id}
                                          value={category.id}
                                          onSelect={() => {
                                            field.onChange(
                                              category.id === field.value
                                                ? ""
                                                : category.id
                                            );
                                            setCategoryOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === category.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {category.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                        {errors.categoryId && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {errors.categoryId.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {categoryName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Time Limit */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("admin.tests.info.fields.timeLimit")}
                    <span className="text-red-500 dark:text-red-400 ml-1">
                      *
                    </span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          {...register("timeLimit", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          min="1"
                          className={cn(
                            "text-sm",
                            errors.timeLimit &&
                              "border-red-500 dark:border-red-600 focus-visible:ring-red-500 dark:focus-visible:ring-red-600"
                          )}
                          disabled={isSubmitting}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {t("common.minutes")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {test.timeLimit} {t("common.minutes")}
                      </span>
                    )}
                    {isEditing && errors.timeLimit && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 absolute top-full left-0">
                        {errors.timeLimit.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Question Count */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("admin.tests.info.fields.questionCount")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {test.questionCount ?? 0}
                    </span>
                  </div>
                </div>

                {/* Created At */}
                {test.createdAt && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t("admin.tests.info.fields.createdAt")}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {formatUnixTimestamp(
                          typeof test.createdAt === "string"
                            ? parseInt(test.createdAt)
                            : test.createdAt
                        ) || "-"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Updated At */}
                {test.updatedAt && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t("admin.tests.info.fields.updatedAt")}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {formatUnixTimestamp(
                          typeof test.updatedAt === "string"
                            ? parseInt(test.updatedAt)
                            : test.updatedAt
                        ) || "-"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t("admin.tests.info.fields.description")}
                </h3>
                <div className="flex items-start gap-2">
                  <List className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  {isEditing ? (
                    <div className="flex-1">
                      <Textarea
                        {...register("description")}
                        rows={4}
                        className={cn(
                          "text-sm",
                          errors.description &&
                            "border-red-500 dark:border-red-600 focus-visible:ring-red-500 dark:focus-visible:ring-red-600"
                        )}
                        disabled={isSubmitting}
                        placeholder={t(
                          "admin.tests.form.descriptionPlaceholder"
                        )}
                      />
                      {errors.description && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {test.description || t("admin.tests.info.noDescription")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
