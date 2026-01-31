import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "@/i18n";
import { type Column } from "@/components/common/data-table";
import {

  useFilterActions,
  useFilterHandlers,
  useFilterIdsConfig,
  useFilterParams,
  createStringConverter,
  createArrayConverter,

  useAdminListData,
  usePageData,
} from "@/hooks";
import { useAdminListActions } from "@/modules/admin/hooks";
import { AdminList } from "@/modules/admin/components";
import { useTestsStore, type TestProps } from "../hooks";
import { useCategoriesStore } from "../../categories/hooks";
import { FileQuestion } from "lucide-react";
import { TestFormDialog } from "./form-dialog";
import { TestsListSkeleton } from "./list-skeleton";
import { DIALOG_MODES } from "@/constants";
import {
  MultipleSelectCombobox,
  type ActiveFilter,
} from "@/components/common/filters";
import { ROUTES } from "../constants";
import { MAX_PAGE_SIZE_FOR_ALL } from "@/constants/app";
import { ROUTES as QUESTIONS_ROUTES } from "../../questions/constants";

interface TestsListProps {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

export function TestsList({ roles }: TestsListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { getFilter, setFilter } = useFilterParams();

  const [searchInput, setSearchInput] = useState("");
  const searchValue = getFilter("name") || "";
  const selectedCategories = useMemo(() => getFilter("categoryId")?.split(",").filter(Boolean) || [], [getFilter]);

  const { tests, loading, fetchTests, deleteTest, openDialog } =
    useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  usePageData(
    async () => {
      await fetchCategories(1, MAX_PAGE_SIZE_FOR_ALL);
    },
    {
      errorKey: "errors.fetchFilterDataFailed",
      showLoading: false,
      showError: false,
      onError: (error) => {
        console.error("Failed to fetch filter data:", error);
      },
    }
  );

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => {
      map.set(category.id, category.name);
    });
    return map;
  }, [categories]);

  const testsWithCategoryNames = useMemo(() => {
    return tests.map((test) => ({
      ...test,
      categoryName:
        test.categoryName ||
        categoryMap.get(test.categoryId) ||
        test.categoryId,
    }));
  }, [tests, categoryMap]);

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

  const fetchTestsRef = useRef(fetchTests);
  useEffect(() => {
    fetchTestsRef.current = fetchTests;
  }, [fetchTests]);

  const fetchTestsWrapper = useCallback(
    async (
      page: number,
      pageSize: number,
      filters?: Record<string, string>
    ) => {
      const result = await fetchTestsRef.current(page, pageSize, filters);
      const state = useTestsStore.getState();
      return {
        data: state.tests,
        meta: result?.meta || { total: 0 },
      };
    },
    []
  );

  const {
    apiFilters,
    hasInitialFetch,
    handlePageChange,
    handlePageSizeChange,
    page,
    pageSize,
    total,
    setPage,
  } = useAdminListData({

    filterConfig,

    fetchFunction: fetchTestsWrapper,
    onFilterAppliedFromUrl: setSearchInput,
  });

  const filterHandlers = useMemo(
    () => [
      {
        filterId: "name",
        resetValue: () => {
          setSearchInput("");
          setFilter("name", null);
        },
      },
      {
        filterId: "categoryId",
        resetValue: () => {
          setFilter("categoryId", null);
        },
      },
    ],
    []
  );



  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers({
    handlers: filterHandlers,
  });

  const handleRemoveCategory = useCallback(
    (categoryId: string) => {
      const newCats = selectedCategories.filter((id) => id !== categoryId);
      setFilter("categoryId", newCats.length ? newCats.join(",") : null);
    },
    [selectedCategories, setFilter]
  );

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (searchValue) {
      filters.push({
        id: "name",
        label: t("admin.tests.columns.name"),
        value: searchValue,
      });
    }
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

  const handleRemoveActiveFilter = useCallback(
    (filterId: string) => {
      if (filterId.startsWith("categoryId_")) {
        const categoryId = filterId.replace("categoryId_", "");
        handleRemoveCategory(categoryId);
      } else {
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
    setFilter("name", searchInput);
  }, [searchInput, setFilter]);

  const filterActionButtons = useFilterActions({
    onSearch: handleSearch,
    activeFilters,
    onClearFilters: handleClearAllFilters,
  });

  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categories]);

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

  const handleViewQuestions = useCallback(
    (test: TestProps) => {
      const searchParams = new URLSearchParams();
      searchParams.set("test_id", test.id);
      navigate(`${QUESTIONS_ROUTES.INDEX}?${searchParams.toString()}`);
    },
    [navigate]
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

  const { actions: baseActions } = useAdminListActions<TestProps>({
    roles,
    deleteFunction: async (id: string) => {
      await deleteTest(id);
      await fetchTests(page, pageSize, apiFilters);
    },
    refreshFunction: async (refreshPage: number, refreshPageSize: number) => {
      await fetchTests(refreshPage, refreshPageSize, apiFilters);
    },
    successMessageKey: "admin.tests.deleteSuccess",
    deleteTitleKey: "admin.tests.delete",
    confirmDeleteKey: "admin.tests.confirmDelete",
    deleteButtonKey: "admin.tests.delete",
    onClearFilters: handleClearAllFilters,
    onView: handleViewInfo,
    onEdit: (test: TestProps) => openDialog(DIALOG_MODES.EDIT, test),
  });

  const actions = useMemo(() => {
    const result = [...baseActions];
    if (roles.read) {
      result.push({
        label: t("admin.tests.viewQuestions"),
        onClick: handleViewQuestions,
        icon: <FileQuestion className="h-4 w-4" />,
        className:
          "border-orange-500/50 text-orange-600 hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-600 hover:text-white hover:border-orange-600 dark:border-orange-400/50 dark:text-orange-400 dark:hover:from-orange-600 dark:hover:to-amber-700 dark:hover:border-orange-500",
        actionType: "default" as const,
      });
    }
    return result;
  }, [baseActions, roles, t, handleViewQuestions]);

  const handleRefresh = useCallback(async () => {
    await fetchTests(page, pageSize, apiFilters);
  }, [fetchTests, page, pageSize, apiFilters]);

  if (
    loading &&
    testsWithCategoryNames.length === 0 &&
    !hasInitialFetch
  ) {
    return (
      <>
        <TestsListSkeleton />
      </>
    );
  }

  const additionalFilters = (
    <>
      <MultipleSelectCombobox
        options={categoryOptions}
        selectedValues={selectedCategories}
        onSelect={(values) => {
          setFilter("categoryId", values.length ? values.join(",") : null);
        }}
        placeholder={t("admin.tests.filters.categoryPlaceholder")}
        searchPlaceholder={t("admin.tests.filters.categorySearch")}
        emptyMessage={t("admin.tests.filters.categoryEmpty")}
        className="w-full sm:w-[250px]"
        filterColor="green"
      />
    </>
  );

  return (
    <>
      <AdminList
        columns={columns}
        data={testsWithCategoryNames}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.tests.empty")}
        searchInput={{
          value: searchInput,
          onChange: setSearchInput,
          onSearch: handleSearch,
          placeholderKey: "common.searchPlaceholder",
          className: "flex-1 min-w-[200px]",
          searchKey: "name",
        }}
        additionalFilters={additionalFilters}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveActiveFilter}
        filterIdsConfig={filterIdsConfig}
        filterActionButtons={filterActionButtons}
        pagination={paginationProps}
        filterBarClassName="my-4"
      />
      <TestFormDialog
        onClearFilters={handleClearAllFilters}
        onRefresh={handleRefresh}
      />
    </>
  );
}
