import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router";
import { useTranslation } from "@/i18n";
import {
  DataTable,
  Pagination,
  type Column,
  type Action,
} from "@/components/common/data-table";
import {
  usePaginationStore,
  useApp,
  useFilterActions,
  useFilterHandlers,
  useFilterIdsConfig,
  createStringConverter,
  createArrayConverter,
  useSyncFilterToUrl,
  useApplyFilterFromUrl,
  FilterManager,
  createStringFilterHandler,
  createArrayFilterHandler,
} from "@/hooks";
import { useQuestionsStore } from "../hooks";
import type { QuestionProps } from "../types";
import { useCategoriesStore } from "../../categories/hooks";
import { useTestsStore } from "../../tests/hooks";
import { Eye, Trash2, CheckSquare, Square } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  SearchInput,
  ActiveFilters,
  FilterActions,
  MultipleSelectCombobox,
  FilterDropdown,
  type ActiveFilter,
} from "@/components/common/filters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "../constants";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants/app";
import { QuestionDialog } from "./question-dialog";

interface QuestionsListProps {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

export function QuestionsList({ roles }: QuestionsListProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess, showDialog, closeDialog } = useApp();
  const {
    page,
    pageSize,
    total,
    setPage,
    setPageSize,
    setTotal,
    setCurrentRoute,
  } = usePaginationStore();

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [selectedQuestionType, setSelectedQuestionType] = useState<
    string | undefined
  >(undefined);

  // Track if filters are being applied from URL
  const isApplyingFiltersFromUrl = useRef(false);
  const hasInitialFetch = useRef(false);

  // Reset pagination when route changes
  useEffect(() => {
    const routePath = location.pathname;
    setCurrentRoute(routePath);
  }, [location.pathname, setCurrentRoute]);

  const {
    questions,
    loading,
    total: questionsTotal,
    fetchQuestions,
    deleteQuestion,
    refreshQuestions,
  } = useQuestionsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const { adminTests: tests, fetchTests } = useTestsStore();

  // Fetch categories and tests for filters
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchCategories(1, MAX_PAGE_SIZE_FOR_ALL),
          fetchTests(1, MAX_PAGE_SIZE_FOR_ALL),
        ]);
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
      }
    };
    loadData();
  }, [fetchCategories, fetchTests]);

  // Clear selected tests that are no longer valid when categories change
  useEffect(() => {
    if (selectedCategories.length > 0 && selectedTests.length > 0) {
      const validTestIds = tests
        .filter((test) => selectedCategories.includes(test.categoryId))
        .map((test) => test.id);
      const invalidTests = selectedTests.filter(
        (testId) => !validTestIds.includes(testId)
      );
      if (invalidTests.length > 0) {
        setSelectedTests((prev) =>
          prev.filter((testId) => validTestIds.includes(testId))
        );
      }
    } else if (selectedCategories.length === 0) {
      // If no categories selected, keep all selected tests
    }
  }, [selectedCategories, tests, selectedTests]);

  // Create maps for category and test names
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => {
      map.set(category.id, category.name);
    });
    return map;
  }, [categories]);

  const testMap = useMemo(() => {
    const map = new Map<string, string>();
    tests.forEach((test) => {
      map.set(test.id, test.name);
    });
    return map;
  }, [tests]);

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
        filterId: "categoryId",
        resetValue: () => {
          setSelectedCategories([]);
        },
      },
      {
        filterId: "testId",
        resetValue: () => {
          setSelectedTests([]);
        },
      },
      {
        filterId: "isMultipleChoice",
        resetValue: () => {
          setSelectedQuestionType(undefined);
        },
      },
    ],
    []
  );

  // Filter config
  const filterConfig = useMemo(
    () => [
      {
        filterKey: "content",
        value: searchValue,
        defaultValue: "",
        converter: createStringConverter(),
      },
      {
        filterKey: "categoryId",
        value: selectedCategories,
        defaultValue: [],
        converter: createArrayConverter(),
      },
      {
        filterKey: "testId",
        value: selectedTests,
        defaultValue: [],
        converter: createArrayConverter(),
      },
      {
        filterKey: "isMultipleChoice",
        value: selectedQuestionType ?? "",
        defaultValue: "",
        converter: createStringConverter(),
      },
    ],
    [searchValue, selectedCategories, selectedTests, selectedQuestionType]
  );

  // Apply filters from URL
  const { hasFilterParams } = useApplyFilterFromUrl({
    filterHandlers: {
      content: createStringFilterHandler(setSearchValue),
      categoryId: createArrayFilterHandler(setSelectedCategories),
      testId: createArrayFilterHandler(setSelectedTests),
      isMultipleChoice: createStringFilterHandler(setSelectedQuestionType),
    },
    onFilterApplied: async () => {
      isApplyingFiltersFromUrl.current = true;
      hasInitialFetch.current = true;
      setPage(1);

      const urlFilters = FilterManager.extractFiltersFromUrl(searchParams);
      const contentFilter = urlFilters.find((f) => f.key === "content");
      if (contentFilter) {
        setSearchInput(contentFilter.value);
      }

      try {
        const apiFilters = FilterManager.convertFiltersToApiParams(urlFilters);
        await fetchQuestions(1, pageSize, apiFilters);
        // Note: total will be set from the store
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.fetchDashboardFailed");
        showError(errorMessage);
      } finally {
        isApplyingFiltersFromUrl.current = false;
      }
    },
    hookId: "questions",
  });

  // Sync filters to URL
  useSyncFilterToUrl({
    filters: filterConfig,
    hookId: "questions",
  });

  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers({
    handlers: filterHandlers,
    onFilterChange: () => {
      setPage(1);
    },
  });

  // Handler to remove a specific category from the array
  const handleRemoveCategory = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    setPage(1);
  }, []);

  // Handler to remove a specific test from the array
  const handleRemoveTest = useCallback((testId: string) => {
    setSelectedTests((prev) => prev.filter((id) => id !== testId));
    setPage(1);
  }, []);

  // Active filters for display
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (searchValue) {
      filters.push({
        id: "content",
        label: t("admin.questions.columns.content"),
        value: searchValue,
      });
    }
    selectedCategories.forEach((categoryId) => {
      const categoryLabel = categoryMap.get(categoryId) || categoryId;
      filters.push({
        id: `categoryId_${categoryId}`,
        label: t("admin.questions.filters.category"),
        value: categoryLabel,
      });
    });
    selectedTests.forEach((testId) => {
      const testLabel = testMap.get(testId) || testId;
      filters.push({
        id: `testId_${testId}`,
        label: t("admin.questions.filters.test"),
        value: testLabel,
      });
    });
    if (selectedQuestionType) {
      const typeLabel =
        selectedQuestionType === "true"
          ? t("admin.questions.multipleChoice")
          : t("admin.questions.singleChoice");
      filters.push({
        id: "isMultipleChoice",
        label: t("admin.questions.columns.isMultipleChoice"),
        value: typeLabel,
      });
    }
    return filters;
  }, [
    searchValue,
    selectedCategories,
    selectedTests,
    selectedQuestionType,
    categoryMap,
    testMap,
    t,
  ]);

  // Custom handler for removing filters that handles array items
  const handleRemoveActiveFilter = useCallback(
    (filterId: string) => {
      if (filterId.startsWith("categoryId_")) {
        const categoryId = filterId.replace("categoryId_", "");
        handleRemoveCategory(categoryId);
      } else if (filterId.startsWith("testId_")) {
        const testId = filterId.replace("testId_", "");
        handleRemoveTest(testId);
      } else {
        handleRemoveFilter(filterId);
      }
    },
    [handleRemoveFilter, handleRemoveCategory, handleRemoveTest]
  );

  const filterIdsConfig = useFilterIdsConfig({
    handlers: filterHandlers,
    colorMap: {
      content: "blue",
      categoryId: "green",
      testId: "purple",
      isMultipleChoice: "yellow",
    },
  });

  const handleSearch = () => {
    setSearchValue(searchInput);
    setPage(1);
  };

  const filterActionButtons = useFilterActions({
    onSearch: handleSearch,
    activeFilters,
    onClearFilters: handleClearAllFilters,
  });

  // Convert filters to API params
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

  // Category and test options for combobox
  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categories]);

  const testOptions = useMemo(() => {
    // Filter tests based on selected categories
    if (!tests || tests.length === 0) {
      return [];
    }

    let filteredTests = tests;
    if (selectedCategories.length > 0) {
      filteredTests = tests.filter((test) => {
        // Ensure test has categoryId and it matches selected categories
        if (!test.categoryId) {
          return false;
        }
        return selectedCategories.includes(test.categoryId);
      });
    }

    return filteredTests.map((test) => ({
      value: test.id,
      label: test.name,
    }));
  }, [tests, selectedCategories]);

  // Enrich questions with test names
  const questionsWithTestNames = useMemo(() => {
    return questions.map((question) => ({
      ...question,
      testName: question.test
        ? testMap.get(question.test) || question.test || "-"
        : question.test || "-",
    }));
  }, [questions, testMap]);

  // Fetch questions
  useEffect(() => {
    if (
      (hasFilterParams && !hasInitialFetch.current) ||
      isApplyingFiltersFromUrl.current
    ) {
      return;
    }

    const loadQuestions = async () => {
      try {
        await fetchQuestions(page, pageSize, apiFilters);
        // Note: total is set in the store
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.fetchDashboardFailed");
        showError(errorMessage);
      }
    };

    loadQuestions();
    hasInitialFetch.current = true;
  }, [
    page,
    pageSize,
    apiFilters,
    hasFilterParams,
    fetchQuestions,
    showError,
    t,
  ]);

  // Update total from store
  useEffect(() => {
    setTotal(questionsTotal);
  }, [questionsTotal, setTotal]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const handleViewInfo = (question: QuestionProps) => {
    // Navigate to question detail or test info page
    navigate(ROUTES.QUESTIONS.EDIT.replace(":questionId", question.id));
  };

  const handleDelete = (question: QuestionProps) => {
    const confirmDelete = async () => {
      try {
        // Delete question (testId is not needed for delete endpoint)
        await deleteQuestion("", question.id, page, pageSize, apiFilters);
        showSuccess(t("admin.questions.deleteSuccess"));
        await fetchQuestions(page, pageSize, apiFilters);
        closeDialog();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      }
    };

    showDialog({
      title: t("admin.questions.delete"),
      content: (
        <AlertDialogDescription>
          {t("admin.questions.confirmDelete")}
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
            {t("admin.questions.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      ),
    });
  };

  const columns: Column<QuestionProps>[] = [
    {
      key: "id",
      header: t("admin.questions.columns.id"),
      className: "w-[50px]",
      render: (question) => (
        <span className="truncate block max-w-[100px]" title={question.id}>
          {question.id}
        </span>
      ),
    },
    {
      key: "content",
      header: t("admin.questions.columns.content"),
      className: "w-[600px]",
      render: (question) => (
        <span className="font-medium line-clamp-2">{question.content}</span>
      ),
    },
    {
      key: "category",
      header: t("admin.questions.columns.category"),
      render: (question) => (
        <span className="text-muted-foreground">
          {question.category || "-"}
        </span>
      ),
    },
    {
      key: "test",
      header: t("admin.questions.columns.test"),
      render: (question) => (
        <span className="text-muted-foreground">{question.test || "-"}</span>
      ),
    },
    {
      key: "isMultipleChoice",
      header: t("admin.questions.columns.isMultipleChoice"),
      meta: { center: true },
      render: (question) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center">
                {question.isMultipleChoice ? (
                  <CheckSquare className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {question.isMultipleChoice
                  ? t("admin.questions.multipleChoice")
                  : t("admin.questions.singleChoice")}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "answers",
      header: t("admin.questions.columns.answers"),
      meta: { center: true },
      render: (question) => (
        <span className="text-muted-foreground">
          {question.answers?.length || 0}
        </span>
      ),
    },
  ];

  const actions: Action<QuestionProps>[] = [
    ...(roles.read
      ? [
          {
            label: t("common.viewInfo"),
            onClick: handleViewInfo,
            icon: <Eye className="h-4 w-4" />,
            actionType: "viewInfo" as const,
          },
        ]
      : []),
    ...(roles.delete
      ? [
          {
            label: t("admin.questions.delete"),
            onClick: handleDelete,
            variant: "destructive" as const,
            icon: <Trash2 className="h-4 w-4" />,
            actionType: "delete" as const,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Filter Bar */}
      <div className="my-4 flex flex-col gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            placeholderKey="admin.questions.filters.searchPlaceholder"
            className="flex-1 min-w-[200px]"
            searchKey="content"
          />
          <MultipleSelectCombobox
            options={categoryOptions}
            selectedValues={selectedCategories}
            onSelect={(values) => {
              setSelectedCategories(values);
              setPage(1);
            }}
            placeholder={t("admin.questions.filters.categoryPlaceholder")}
            searchPlaceholder={t("admin.questions.filters.categorySearch")}
            emptyMessage={t("admin.questions.filters.categoryEmpty")}
            className="w-full sm:w-[250px]"
            filterColor="green"
          />
          <MultipleSelectCombobox
            options={testOptions}
            selectedValues={selectedTests}
            onSelect={(values) => {
              setSelectedTests(values);
              setPage(1);
            }}
            placeholder={t("admin.questions.filters.testPlaceholder")}
            searchPlaceholder={t("admin.questions.filters.testSearch")}
            emptyMessage={t("admin.questions.filters.testEmpty")}
            className="w-full sm:w-[250px]"
            filterColor="purple"
          />
          <FilterDropdown
            labelKey="admin.questions.filters.multipleChoicePlaceholder"
            options={[
              {
                value: "true",
                labelKey: "admin.questions.multipleChoice",
              },
              {
                value: "false",
                labelKey: "admin.questions.singleChoice",
              },
            ]}
            selectedValue={selectedQuestionType}
            buttonClassName="w-full sm:w-[200px] justify-between"
            filterColor="yellow"
            onSelect={(value) => {
              setSelectedQuestionType(
                value === selectedQuestionType ? undefined : value
              );
              setPage(1);
            }}
          />
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
        columns={columns}
        data={questionsWithTestNames}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.questions.empty")}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      <QuestionDialog />
    </>
  );
}
