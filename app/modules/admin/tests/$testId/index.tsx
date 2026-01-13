import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { RESOURCES } from "@/constants/permissions";
import { ROUTES } from "@/constants";
import { useTestsStore, useQuestionStore } from "../hooks";
import type { TestProps } from "../types";
import { useCategoriesStore } from "../../categories/hooks";
import {
  usePaginationStore,
  useFilterActions,
  useFilterIdsConfig,
  useSyncFilterToUrl,
  useApplyFilterFromUrl,
  createStringConverter,
  createStringFilterHandler,
  FilterManager,
  type ActiveFilter,
} from "@/hooks";
import {
  SearchInput,
  FilterActions,
  ActiveFilters,
} from "@/components/common/filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FILTER_COLOR_PALETTE } from "@/constants/filters";
import { Pagination } from "@/components/common/data-table";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
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
  Trash2,
  Eye,
  Plus,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatUnixTimestamp, cn } from "@/lib";
import { useApp, useBreadcrumb } from "@/hooks";
import { PageHeader } from "@/components/page-header";
import { testSchema, type TestFormData } from "../schemas";
import { DataTable } from "@/components/common/data-table";
import type { QuestionProps } from "../types";

export default function AdminTestInfo() {
  const { t } = useTranslation();
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getNamespaceRoles } = useRole();
  const { showSuccess, showError: showAppError } = useApp();

  const roles = getNamespaceRoles(RESOURCES.TEST);
  const questionRoles = getNamespaceRoles(RESOURCES.QUESTION);
  const { getTestById, updateTest, deleteTest } = useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const {
    questions,
    loading: questionsLoading,
    fetchQuestions,
    deleteQuestion,
    total: questionsTotal,
  } = useQuestionStore();
  const { showDialog, closeDialog } = useApp();
  const {
    page: questionsPage,
    pageSize: questionsPageSize,
    total: questionsTotalState,
    setPage: setQuestionsPage,
    setPageSize: setQuestionsPageSize,
    setTotal: setQuestionsTotal,
  } = usePaginationStore();

  // Filter states for questions
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedMultipleChoice, setSelectedMultipleChoice] =
    useState<string>("");

  // Track if filters are being applied from URL
  const isApplyingFiltersFromUrl = useRef(false);
  const hasInitialFetch = useRef(false);

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

  // Filter config for URL sync
  const filterConfig = useMemo(
    () => [
      {
        filterKey: "content",
        value: searchValue,
        defaultValue: "",
        converter: createStringConverter(),
      },
      {
        filterKey: "isMultipleChoice",
        value: selectedMultipleChoice,
        defaultValue: "",
        converter: createStringConverter(),
      },
    ],
    [searchValue, selectedMultipleChoice]
  );

  // Apply filters from URL
  const { hasFilterParams } = useApplyFilterFromUrl({
    filterHandlers: {
      content: createStringFilterHandler(setSearchValue),
      isMultipleChoice: createStringFilterHandler(setSelectedMultipleChoice),
    },
    onFilterApplied: async () => {
      isApplyingFiltersFromUrl.current = true;
      hasInitialFetch.current = true;
      setQuestionsPage(1);

      // Also set search input from URL
      const urlFilters = FilterManager.extractFiltersFromUrl(searchParams);
      const contentFilter = urlFilters.find((f) => f.key === "content");
      if (contentFilter) {
        setSearchInput(contentFilter.value);
      }

      try {
        const apiFilters = FilterManager.convertFiltersToApiParams(urlFilters);
        if (testId) {
          await fetchQuestions(testId, 1, questionsPageSize, apiFilters);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        isApplyingFiltersFromUrl.current = false;
      }
    },
    hookId: `questions-${testId}`,
  });

  // Sync filters to URL
  useSyncFilterToUrl({
    filters: filterConfig,
    hookId: `questions-${testId}`,
  });

  // Build API filters using FilterManager pattern
  const apiFilters = useMemo(() => {
    const activeFilters: Array<{ key: string; value: string }> = [];
    filterConfig.forEach((filter) => {
      const converted = filter.converter(filter.value as any);
      if (converted === null) return;

      let isActive = false;
      if (Array.isArray(converted)) {
        isActive = converted.length > 0;
      } else if (filter.defaultValue !== undefined) {
        const defaultConverted = filter.converter(filter.defaultValue as any);
        isActive = converted !== defaultConverted;
      } else {
        isActive = converted !== "";
      }

      if (isActive) {
        const filterValue = Array.isArray(converted)
          ? converted.join(",")
          : converted;
        activeFilters.push({
          key: filter.filterKey,
          value: filterValue,
        });
      }
    });
    return FilterManager.convertFiltersToApiParams(activeFilters);
  }, [filterConfig]);

  // Fetch questions when testId, page, pageSize, or filters change
  useEffect(() => {
    // Skip initial fetch if filters are being applied from URL
    if (
      (hasFilterParams && !hasInitialFetch.current) ||
      isApplyingFiltersFromUrl.current
    ) {
      return;
    }

    if (!testId) return;

    const loadQuestions = async () => {
      try {
        await fetchQuestions(
          testId,
          questionsPage,
          questionsPageSize,
          apiFilters
        );
        setQuestionsTotal(questionsTotal);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    };

    loadQuestions();
    hasInitialFetch.current = true;
  }, [
    testId,
    questionsPage,
    questionsPageSize,
    apiFilters,
    fetchQuestions,
    questionsTotal,
    setQuestionsTotal,
    hasFilterParams,
  ]);

  // Handle search
  const handleSearch = useCallback(() => {
    setSearchValue(searchInput);
    setQuestionsPage(1);
  }, [searchInput, setQuestionsPage]);

  // Handle filter actions
  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setSearchValue("");
    setSelectedMultipleChoice("");
    setQuestionsPage(1);
  }, [setQuestionsPage]);

  // Active filters for display
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (searchValue) {
      filters.push({
        id: "content",
        label: t("admin.tests.questions.columns.content"),
        value: searchValue,
      });
    }
    if (selectedMultipleChoice && selectedMultipleChoice !== "") {
      const label =
        selectedMultipleChoice === "true"
          ? t("admin.tests.questions.filters.multipleChoice")
          : t("admin.tests.questions.filters.singleChoice");
      filters.push({
        id: "isMultipleChoice",
        label: t("admin.tests.questions.columns.isMultipleChoice"),
        value: label,
      });
    }
    return filters;
  }, [searchValue, selectedMultipleChoice, t]);

  // Filter handlers
  const filterHandlers = useMemo(
    () => [
      {
        filterId: "content",
        resetValue: () => {
          setSearchInput("");
          setSearchValue("");
        },
      },
      {
        filterId: "isMultipleChoice",
        resetValue: () => {
          setSelectedMultipleChoice("");
        },
      },
    ],
    []
  );

  // Handle remove active filter
  const handleRemoveActiveFilter = useCallback(
    (filterId: string) => {
      if (filterId === "content") {
        setSearchInput("");
        setSearchValue("");
      } else if (filterId === "isMultipleChoice") {
        setSelectedMultipleChoice("");
      }
      setQuestionsPage(1);
    },
    [setQuestionsPage]
  );

  const filterIdsConfig = useFilterIdsConfig({
    handlers: filterHandlers,
    colorMap: {
      content: "blue",
      isMultipleChoice: "purple",
    },
  });

  const filterActionButtons = useFilterActions({
    onSearch: handleSearch,
    activeFilters,
    onClearFilters: handleClearFilters,
  });

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

  const handleDeleteTest = () => {
    if (!test) return;

    const confirmDelete = async () => {
      try {
        await deleteTest(test.id);
        showSuccess(t("admin.tests.deleteSuccess"));
        navigate(ROUTES.ADMIN.TESTS);
        closeDialog();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showAppError(errorMessage);
      }
    };

    showDialog({
      title: t("admin.tests.delete"),
      content: (
        <AlertDialogDescription>
          {t("admin.tests.confirmDelete", {
            name: test.name,
          } as any)}
        </AlertDialogDescription>
      ),
      footer: (
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDialog}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("admin.tests.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      ),
    });
  };

  const handleDeleteQuestion = (question: QuestionProps) => {
    const confirmDelete = async () => {
      if (!testId) return;
      try {
        await deleteQuestion(
          testId,
          question.id,
          questionsPage,
          questionsPageSize,
          apiFilters
        );
        showSuccess(t("admin.tests.questions.deleteSuccess"));
        // Reload test to update question count
        const updatedTest = await getTestById(testId);
        if (updatedTest) {
          setTest(updatedTest);
        }
        closeDialog();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showAppError(errorMessage);
      }
    };

    showDialog({
      title: t("admin.tests.questions.delete"),
      content: (
        <AlertDialogDescription>
          {t("admin.tests.questions.confirmDelete", {
            content: question.content.substring(0, 50) + "...",
          } as any)}
        </AlertDialogDescription>
      ),
      footer: (
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDialog}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("admin.tests.questions.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      ),
    });
  };

  const handleViewQuestionInfo = (question: QuestionProps) => {
    showDialog({
      title: t("admin.tests.questions.info"),
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">
              {t("admin.tests.questions.fields.content")}
            </h4>
            <p className="text-sm text-muted-foreground">{question.content}</p>
          </div>
          {question.imageUrl && (
            <div>
              <h4 className="text-sm font-semibold mb-2">
                {t("admin.tests.questions.fields.image")}
              </h4>
              <img
                src={question.imageUrl}
                alt="Question"
                className="max-w-full h-auto rounded"
              />
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold mb-2">
              {t("admin.tests.questions.fields.answers")}
            </h4>
            <div className="space-y-2">
              {question.answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className={cn(
                    "p-2 rounded text-sm",
                    answer.isCorrect
                      ? "bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700"
                      : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                  )}
                >
                  <span className="font-medium">{index + 1}. </span>
                  {answer.content}
                  {answer.isCorrect && (
                    <span className="ml-2 text-green-600 dark:text-green-400">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      footer: (
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDialog}>
            {t("common.close")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      ),
    });
  };

  const handleCreateQuestion = () => {
    // Navigate to create question page or open dialog
    // For now, we'll show a message that this feature needs to be implemented
    showAppError(t("admin.tests.questions.createNotImplemented"));
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
              <div className="flex items-center gap-2">
                {roles.update && (
                  <>
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
                  </>
                )}
                {roles.delete && !isEditing && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteTest}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("admin.tests.delete")}
                  </Button>
                )}
              </div>
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

        {/* Questions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                {t("admin.tests.questions.title")}
              </div>
              {questionRoles.create && (
                <Button
                  size="sm"
                  onClick={handleCreateQuestion}
                  className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 dark:from-green-600 dark:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  {t("admin.tests.questions.create")}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter Bar */}
            <div className="mb-4 flex flex-col gap-4">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <SearchInput
                  value={searchInput}
                  onChange={setSearchInput}
                  onSearch={handleSearch}
                  placeholderKey="admin.tests.questions.filters.searchPlaceholder"
                  className="flex-1 min-w-[200px]"
                  searchKey="content"
                />
                <Select
                  {...(selectedMultipleChoice && selectedMultipleChoice !== ""
                    ? { value: selectedMultipleChoice }
                    : {})}
                  onValueChange={(value) => {
                    setSelectedMultipleChoice(value);
                    setQuestionsPage(1);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "h-10 w-full sm:w-[250px]",
                      FILTER_COLOR_PALETTE.purple,
                      selectedMultipleChoice &&
                        selectedMultipleChoice !== "" &&
                        "border-purple-500/30 dark:border-purple-500/30"
                    )}
                  >
                    <SelectValue
                      placeholder={t(
                        "admin.tests.questions.filters.multipleChoicePlaceholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">
                      {t("admin.tests.questions.filters.multipleChoice")}
                    </SelectItem>
                    <SelectItem value="false">
                      {t("admin.tests.questions.filters.singleChoice")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FilterActions buttons={filterActionButtons} />
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="mb-4">
                <ActiveFilters
                  filters={activeFilters}
                  onRemove={handleRemoveActiveFilter}
                  filterIdsConfig={filterIdsConfig}
                />
              </div>
            )}

            <DataTable
              columns={[
                {
                  key: "id",
                  header: t("admin.tests.questions.columns.id"),
                  className: "w-[100px]",
                  render: (question) => (
                    <span
                      className="truncate block max-w-[100px] font-mono text-xs"
                      title={question.id}
                    >
                      {question.id}
                    </span>
                  ),
                },
                {
                  key: "content",
                  header: t("admin.tests.questions.columns.content"),
                  render: (question) => (
                    <span className="text-sm line-clamp-2">
                      {question.content}
                    </span>
                  ),
                },
                {
                  key: "isMultipleChoice",
                  header: t("admin.tests.questions.columns.isMultipleChoice"),
                  meta: { center: true },
                  className: "w-[120px]",
                  render: (question) => (
                    <div className="flex justify-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center">
                              {question.isMultipleChoice ? (
                                <CheckSquare className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {question.isMultipleChoice
                                ? t("admin.tests.questions.multipleChoice")
                                : t("admin.tests.questions.singleChoice")}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ),
                },
                {
                  key: "answers",
                  header: t("admin.tests.questions.columns.answers"),
                  meta: { center: true },
                  render: (question) => (
                    <span className="text-sm text-muted-foreground">
                      {question.answers?.length || 0}
                    </span>
                  ),
                },
              ]}
              data={questions}
              actions={[
                ...(questionRoles.read
                  ? [
                      {
                        label: t("common.viewInfo"),
                        onClick: handleViewQuestionInfo,
                        icon: <Eye className="h-4 w-4" />,
                        actionType: "viewInfo" as const,
                      },
                    ]
                  : []),
                ...(questionRoles.delete
                  ? [
                      {
                        label: t("admin.tests.questions.delete"),
                        onClick: handleDeleteQuestion,
                        variant: "destructive" as const,
                        icon: <Trash2 className="h-4 w-4" />,
                        actionType: "delete" as const,
                      },
                    ]
                  : []),
              ]}
              loading={questionsLoading}
              emptyMessage={t("admin.tests.questions.empty")}
            />
            <Pagination
              page={questionsPage}
              pageSize={questionsPageSize}
              total={questionsTotalState}
              onPageChange={setQuestionsPage}
              onPageSizeChange={setQuestionsPageSize}
            />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
