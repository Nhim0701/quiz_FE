import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useTranslation, type TranslationParams } from "@/i18n";
import {
  DataTable,
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
  usePageData,
} from "@/hooks";
import { useTestsStore, type TestProps } from "../hooks";
import { useCategoriesStore } from "../../categories/hooks";
import { Eye, Trash2, Edit, FileQuestion } from "lucide-react";
import { TestFormDialog } from "./form-dialog";
import { TestsListSkeleton } from "./list-skeleton";
import { DIALOG_MODES } from "@/constants";
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
  type ActiveFilter,
} from "@/components/common/filters";
import { ROUTES } from "../constants";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants";
import { ROUTES as QUESTIONS_ROUTES } from "../../questions/constants";
import { FILTER_QUERY_PARAMS } from "@/constants/filters";

interface TestsListProps {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  onClearFiltersReady?: (clearFilters: () => void) => void;
}

export function TestsList({ roles, onClearFiltersReady }: TestsListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess, showDialog, closeDialog } = useApp();
  const { page, pageSize, total, setPage, setPageSize, setTotal } =
    usePaginationStore();

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Track if filters are being applied from URL
  const isApplyingFiltersFromUrl = useRef(false);
  const hasInitialFetch = useRef(false);

  const { tests, loading, fetchTests, deleteTest, refreshTests, openDialog } =
    useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  // Fetch categories to map categoryId to categoryName
  usePageData(() => fetchCategories(1, MAX_PAGE_SIZE_FOR_ALL), {
    errorKey: "errors.fetchCategoriesFailed",
    showLoading: false, // Don't show global loading for filter data
    showError: false, // Handle error silently for filter data
    onError: (error) => {
      // Silently fail - category names are optional
      console.error("Failed to fetch categories:", error);
    },
  });

  // Create category map
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => {
      map.set(category.id, category.name);
    });
    return map;
  }, [categories]);

  // Enrich tests with category names
  const testsWithCategoryNames = useMemo(() => {
    return tests.map((test) => ({
      ...test,
      categoryName:
        test.categoryName ||
        categoryMap.get(test.categoryId) ||
        test.categoryId,
    }));
  }, [tests, categoryMap]);

  // Filter handlers
  const filterHandlers = useMemo(
    () => [
      {
        filterId: "name",
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
    ],
    []
  );

  // Filter config for URL sync
  const filterConfig = useMemo(
    () => [
      {
        filterKey: "name",
        value: searchValue,
        defaultValue: "",
        converter: createStringConverter(),
      },
      {
        filterKey: "categoryId",
        value: selectedCategories,
        defaultValue: [],
        converter: createArrayConverter([]),
      },
    ],
    [searchValue, selectedCategories]
  );

  // Apply filters from URL
  const { hasFilterParams } = useApplyFilterFromUrl({
    filterHandlers: {
      name: createStringFilterHandler(setSearchValue),
      categoryId: createArrayFilterHandler(setSelectedCategories),
    },
    onFilterApplied: async () => {
      isApplyingFiltersFromUrl.current = true;
      hasInitialFetch.current = true;
      setPage(1);

      // Also set search input from URL
      const urlFilters = FilterManager.extractFiltersFromUrl(searchParams);
      const nameFilter = urlFilters.find((f) => f.key === "name");
      if (nameFilter) {
        setSearchInput(nameFilter.value);
      }

      try {
        const apiFilters = FilterManager.convertFiltersToApiParams(urlFilters);
        const result = await fetchTests(1, pageSize, apiFilters);
        if (result?.meta) {
          setTotal(result.meta.total || 0);
        } else if (result?.data) {
          setTotal(result.data.length);
        }
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
    hookId: "tests",
  });

  // Sync filters to URL
  useSyncFilterToUrl({
    filters: filterConfig,
    hookId: "tests",
  });

  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers({
    handlers: filterHandlers,
    onFilterChange: () => {
      setPage(1);
    },
  });

  // Expose clearFilters function to parent component (only once on mount)
  useEffect(() => {
    if (onClearFiltersReady) {
      onClearFiltersReady(handleClearAllFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handler to remove a specific category from the array
  const handleRemoveCategory = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    setPage(1);
  }, []);

  // Active filters for display
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (searchValue) {
      filters.push({
        id: "name",
        label: t("admin.tests.columns.name"),
        value: searchValue,
      });
    }
    // Create separate filter for each selected category
    selectedCategories.forEach((categoryId) => {
      const categoryLabel = categoryMap.get(categoryId) || categoryId;
      filters.push({
        id: `categoryId_${categoryId}`,
        label: t("admin.tests.columns.category"),
        value: categoryLabel,
      });
    });
    return filters;
  }, [searchValue, selectedCategories, categoryMap, t]);

  // Custom handler for removing filters that handles array items
  const handleRemoveActiveFilter = useCallback(
    (filterId: string) => {
      // Check if it's a category filter (format: categoryId_<id>)
      if (filterId.startsWith("categoryId_")) {
        const categoryId = filterId.replace("categoryId_", "");
        handleRemoveCategory(categoryId);
      } else {
        // Use default handler for other filters
        handleRemoveFilter(filterId);
      }
    },
    [handleRemoveFilter, handleRemoveCategory]
  );

  const filterIdsConfig = useFilterIdsConfig({
    handlers: filterHandlers,
    colorMap: {
      name: "blue",
      categoryId: "green",
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

  // Category options for combobox
  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categories]);

  useEffect(() => {
    // Skip initial fetch if filters are being applied from URL
    if (
      (hasFilterParams && !hasInitialFetch.current) ||
      isApplyingFiltersFromUrl.current
    ) {
      return;
    }

    const loadTests = async () => {
      try {
        const result = await fetchTests(page, pageSize, apiFilters);
        if (result?.meta) {
          setTotal(result.meta.total || 0);
        } else if (result?.data) {
          setTotal(result.data.length);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.fetchDashboardFailed");
        showError(errorMessage);
      } finally {
        hasInitialFetch.current = true;
      }
    };

    loadTests();
  }, [
    page,
    pageSize,
    apiFilters,
    hasFilterParams,
    fetchTests,
    setTotal,
    showError,
    t,
  ]);

  const handlePageChange = useCallback(
    (newPage: number) => setPage(newPage),
    [setPage]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => setPageSize(newPageSize),
    [setPageSize]
  );

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
    (test: TestProps) => openDialog(DIALOG_MODES.VIEW, test),
    [openDialog]
  );

  const handleEdit = useCallback(
    (test: TestProps) => openDialog(DIALOG_MODES.EDIT, test),
    [openDialog]
  );

  const handleViewQuestions = useCallback(
    (test: TestProps) => {
      // Navigate to questions page with testId filter
      const searchParams = new URLSearchParams();
      searchParams.set(FILTER_QUERY_PARAMS.FILTER_KEY(1), "testId");
      searchParams.set(FILTER_QUERY_PARAMS.FILTER_VALUE(1), test.id);
      navigate(`${QUESTIONS_ROUTES.INDEX}?${searchParams.toString()}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    (test: TestProps) => {
      const confirmDelete = async () => {
        try {
          await deleteTest(test.id);
          showSuccess(t("admin.tests.deleteSuccess"));
          handleClearAllFilters();
          await refreshTests(1, pageSize);
          closeDialog();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : t("errors.genericError");
          showError(errorMessage);
        }
      };

      showDialog({
        title: t("admin.tests.delete"),
        content: (
          <AlertDialogDescription>
            {t("admin.tests.confirmDelete", {
              name: test.name,
            } as TranslationParams<"admin.tests.confirmDelete">)}
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
    },
    [
      deleteTest,
      showSuccess,
      t,
      handleClearAllFilters,
      refreshTests,
      pageSize,
      closeDialog,
      showDialog,
      showError,
    ]
  );

  const columns = useMemo<Column<TestProps>[]>(
    () => [
      {
        key: "id",
        header: t("admin.tests.columns.id"),
        className: "w-[100px]",
        render: (test) => (
          <span className="truncate block max-w-[100px]" title={test.id}>
            {test.id}
          </span>
        ),
      },
      {
        key: "name",
        header: t("admin.tests.columns.name"),
        render: (test) => <span className="font-medium">{test.name}</span>,
      },
      {
        key: "categoryName",
        header: t("admin.tests.columns.category"),
        render: (test) => (
          <span className="text-muted-foreground">{test.categoryName}</span>
        ),
      },
      {
        key: "questionCount",
        header: t("admin.tests.columns.questionCount"),
        meta: { center: true },
        render: (test) => (
          <span className="text-muted-foreground">
            {test.questionCount ?? 0}
          </span>
        ),
      },
      {
        key: "description",
        header: t("admin.tests.columns.description"),
        render: (test) => (
          <span className="text-muted-foreground text-sm">
            {test.description || "-"}
          </span>
        ),
      },
      {
        key: "timeLimit",
        header: t("admin.tests.columns.timeLimit"),
        meta: { center: true },
        render: (test) => (
          <span className="text-muted-foreground">
            {`${test.timeLimit} ${t("common.minutes")}`}
          </span>
        ),
      },
    ],
    [t]
  );

  const actions = useMemo<Action<TestProps>[]>(
    () => [
      ...(roles.read
        ? [
            {
              label: t("admin.tests.viewInfo"),
              onClick: handleViewInfo,
              icon: <Eye className="h-4 w-4" />,
              actionType: "viewInfo" as const,
            },
          ]
        : []),
      ...(roles.update
        ? [
            {
              label: t("common.edit"),
              onClick: handleEdit,
              icon: <Edit className="h-4 w-4" />,
              actionType: "edit" as const,
            },
          ]
        : []),
      ...(roles.delete
        ? [
            {
              label: t("admin.tests.delete"),
              onClick: handleDelete,
              variant: "destructive" as const,
              icon: <Trash2 className="h-4 w-4" />,
              actionType: "delete" as const,
            },
          ]
        : []),
      ...(roles.read
        ? [
            {
              label: t("admin.tests.viewQuestions"),
              onClick: handleViewQuestions,
              icon: <FileQuestion className="h-4 w-4" />,
              className:
                "border-orange-500/50 text-orange-600 hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-600 hover:text-white hover:border-orange-600 dark:border-orange-400/50 dark:text-orange-400 dark:hover:from-orange-600 dark:hover:to-amber-700 dark:hover:border-orange-500",
              actionType: "default" as const,
            },
          ]
        : []),
    ],
    [roles, t, handleViewInfo, handleEdit, handleDelete, handleViewQuestions]
  );

  // Show skeleton on initial load (after all hooks)
  if (
    loading &&
    testsWithCategoryNames.length === 0 &&
    !hasInitialFetch.current
  ) {
    return (
      <>
        <TestsListSkeleton />
        <TestFormDialog onDelete={handleDelete} />
      </>
    );
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="my-4 flex flex-col gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            placeholderKey="admin.tests.filters.searchPlaceholder"
            className="flex-1 min-w-[200px]"
            searchKey="name"
          />
          <MultipleSelectCombobox
            options={categoryOptions}
            selectedValues={selectedCategories}
            onSelect={(values) => {
              setSelectedCategories(values);
              setPage(1);
            }}
            placeholder={t("admin.tests.filters.categoryPlaceholder" as any)}
            searchPlaceholder={t("admin.tests.filters.categorySearch" as any)}
            emptyMessage={t("admin.tests.filters.categoryEmpty" as any)}
            className="w-full sm:w-[250px]"
            filterColor="green"
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
        data={testsWithCategoryNames}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.tests.empty")}
        pagination={paginationProps}
      />
      <TestFormDialog onDelete={handleDelete} />
    </>
  );
}
