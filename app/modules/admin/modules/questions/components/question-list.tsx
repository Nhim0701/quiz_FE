import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "@/i18n";
import { type Column } from "@/components/common/data-table";
import {
  usePaginationStore,
  useApp,
  useFilterActions,
  useFilterHandlers,
  useFilterIdsConfig,
  createStringConverter,
  createArrayConverter,
  createStringFilterHandler,
  createArrayFilterHandler,
  useAdminListData,
  usePageData,
} from "@/hooks";
import { useAdminListActions } from "@/modules/admin/hooks";
import { AdminList } from "@/modules/admin/components";
import { useQuestionsStore } from "../hooks";
import type { QuestionProps } from "../types";
import { useCategoriesStore } from "../../categories/hooks";
import { useTestsStore } from "../../tests/hooks";
import type { TestProps } from "../../tests/types";
import { QuestionsListSkeleton } from "./list-skeleton";
import { Eye, Trash2, CheckSquare, Square } from "lucide-react";
import {
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
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants/app";
import { QuestionFormDialog } from "./question-form-dialog";
import { ROUTES } from "../constants";

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
  const navigate = useNavigate();
  const { showError, showSuccess, showDialog, closeDialog } = useApp();
  const { page, pageSize, total, setPage, setTotal } = usePaginationStore();

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [selectedQuestionType, setSelectedQuestionType] = useState<
    string | undefined
  >(undefined);

  const {
    questions,
    loading,
    total: questionsTotal,
    fetchQuestions,
    deleteQuestion,
    openDialog,
  } = useQuestionsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const { tests, fetchTests } = useTestsStore();

  // Fetch categories and tests for filters
  usePageData(
    async () => {
      await Promise.all([
        fetchCategories(1, MAX_PAGE_SIZE_FOR_ALL),
        fetchTests(1, MAX_PAGE_SIZE_FOR_ALL),
      ]);
    },
    {
      errorKey: "errors.fetchFilterDataFailed",
      showLoading: false, // Don't show global loading for filter data
      showError: false, // Handle error silently for filter data
      onError: (error) => {
        console.error("Failed to fetch filter data:", error);
      },
    }
  );

  // Clear selected tests that are no longer valid when categories change
  useEffect(() => {
    if (selectedCategories.length > 0 && selectedTests.length > 0) {
      const validTestIds = tests
        .filter((test: { categoryId: string }) =>
          selectedCategories.includes(test.categoryId)
        )
        .map((test: { id: string }) => test.id);
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
    tests.forEach((test: TestProps) => {
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

  const fetchQuestionsRef = useRef(fetchQuestions);
  useEffect(() => {
    fetchQuestionsRef.current = fetchQuestions;
  }, [fetchQuestions]);

  const fetchQuestionsWrapper = useCallback(
    async (
      page: number,
      pageSize: number,
      filters?: Record<string, string>
    ) => {
      await fetchQuestionsRef.current(page, pageSize, filters);
      const state = useQuestionsStore.getState();
      return {
        data: state.questions,
        meta: { total: state.total },
      };
    },
    []
  );

  const {
    apiFilters,
    hasInitialFetch,
    handlePageChange,
    handlePageSizeChange,
  } = useAdminListData({
    hookId: "questions",
    filterConfig,
    filterHandlers: {
      content: createStringFilterHandler((value) => {
        setSearchValue(value);
      }),
      categoryId: createArrayFilterHandler(setSelectedCategories),
      testId: createArrayFilterHandler(setSelectedTests),
      isMultipleChoice: createStringFilterHandler(setSelectedQuestionType),
    },
    fetchFunction: fetchQuestionsWrapper,
    onFilterAppliedFromUrl: setSearchInput,
  });

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

  const handleFilterChange = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers({
    handlers: filterHandlers,
    onFilterChange: handleFilterChange,
  });

  const filterIdsConfig = useFilterIdsConfig({
    handlers: filterHandlers,
    colorMap: {
      content: "blue",
      categoryId: "green",
      testId: "purple",
      isMultipleChoice: "yellow",
    },
  });

  const handleSearch = useCallback(() => {
    setSearchValue(searchInput);
    setPage(1);
  }, [searchInput, setPage]);

  const filterActionButtons = useFilterActions({
    onSearch: handleSearch,
    activeFilters,
    onClearFilters: handleClearAllFilters,
  });

  const handleRemoveCategory = useCallback(
    (categoryId: string) => {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
      setPage(1);
    },
    [setPage]
  );

  const handleRemoveTest = useCallback(
    (testId: string) => {
      setSelectedTests((prev) => prev.filter((id) => id !== testId));
      setPage(1);
    },
    [setPage]
  );

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
      filteredTests = tests.filter((test: TestProps) => {
        // Ensure test has categoryId and it matches selected categories
        if (!test.categoryId) {
          return false;
        }
        return selectedCategories.includes(test.categoryId);
      });
    }

    return filteredTests.map((test: TestProps) => ({
      value: test.id,
      label: test.name,
    }));
  }, [tests, selectedCategories]);

  const questionsWithTestNames = useMemo(() => {
    return questions.map((question: QuestionProps) => ({
      ...question,
      testName: question.test
        ? testMap.get(question.test) || question.test || "-"
        : question.test || "-",
    }));
  }, [questions, testMap]);

  useEffect(() => {
    setTotal(questionsTotal);
  }, [questionsTotal, setTotal]);

  const paginationProps = useMemo(
    () => ({
      page,
      pageSize,
      total,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    }),
    [page, pageSize, total, handlePageChange, handlePageSizeChange]
  );

  const handleViewInfo = useCallback(
    (question: QuestionProps) => {
      navigate(`${ROUTES.VIEW(question.id)}`);
    },
    [navigate]
  );

  const { actions } = useAdminListActions<QuestionProps>({
    roles,
    deleteFunction: async (id: string) => {
      await deleteQuestion("", id, page, pageSize, apiFilters);
    },
    refreshFunction: async (refreshPage: number, refreshPageSize: number) => {
      await fetchQuestions(refreshPage, refreshPageSize, apiFilters);
    },
    successMessageKey: "admin.questions.deleteSuccess",
    deleteTitleKey: "admin.questions.delete",
    confirmDeleteKey: "admin.questions.confirmDelete",
    deleteButtonKey: "admin.questions.delete",
    onClearFilters: handleClearAllFilters,
    onView: handleViewInfo,
    viewIcon: <Eye className="h-4 w-4" />,
    deleteIcon: <Trash2 className="h-4 w-4" />,
  });

  const columns = useMemo<Column<QuestionProps>[]>(
    () => [
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
    ],
    [t]
  );

  // Show skeleton on initial load
  if (
    loading &&
    questionsWithTestNames.length === 0 &&
    !hasInitialFetch.current
  ) {
    return (
      <>
        <QuestionsListSkeleton />
        <QuestionFormDialog />
      </>
    );
  }

  const additionalFilters = (
    <>
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
    </>
  );

  return (
    <>
      <AdminList
        columns={columns}
        data={questionsWithTestNames}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.questions.empty")}
        searchInput={{
          value: searchInput,
          onChange: setSearchInput,
          onSearch: handleSearch,
          placeholderKey: "admin.questions.filters.searchPlaceholder",
          className: "flex-1 min-w-[200px]",
          searchKey: "content",
        }}
        additionalFilters={additionalFilters}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveActiveFilter}
        filterIdsConfig={filterIdsConfig}
        filterActionButtons={filterActionButtons}
        pagination={paginationProps}
        filterBarClassName="my-4"
      />
      <QuestionFormDialog onClearFilters={handleClearAllFilters} />
    </>
  );
}
