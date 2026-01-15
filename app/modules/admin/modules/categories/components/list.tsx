import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "@/i18n";
import { DIALOG_MODES } from "@/constants";
import { type Column } from "@/components/common/data-table";
import {
  usePaginationStore,
  createStringConverter,
  createStringFilterHandler,
  useAdminListData,
  useApp,
} from "@/hooks";
import {
  useAdminListFilters,
  useAdminListActions,
} from "@/modules/admin/hooks";
import { AdminList } from "@/modules/admin/components";
import { useCategoriesStore, type Category } from "../hooks";
import { CategoryFormDialog } from "./form-dialog";
import { CategoriesListSkeleton } from "./list-skeleton";
import type { ActiveFilter } from "@/components/common/filters";
import { ROUTES as TESTS_ROUTES } from "../../tests/constants";
import { FILTER_QUERY_PARAMS } from "@/constants/filters";
import { List } from "lucide-react";

interface CategoriesListProps {
  roles: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  onClearFiltersReady?: (clearFilters: () => void) => void;
}

export function CategoriesList({
  roles,
  onClearFiltersReady,
}: CategoriesListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { page, pageSize, total, setPage } = usePaginationStore();

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const {
    categories,
    loading,
    fetchCategories,
    openDialog,
    deleteCategory,
    refreshCategories,
  } = useCategoriesStore();

  const filterConfig = useMemo(
    () => [
      {
        filterKey: "name",
        value: searchValue,
        defaultValue: "",
        converter: createStringConverter(),
      },
    ],
    [searchValue]
  );

  const {
    apiFilters,
    hasInitialFetch,
    handlePageChange,
    handlePageSizeChange,
  } = useAdminListData({
    hookId: "categories",
    filterConfig,
    filterHandlers: {
      name: createStringFilterHandler((value) => {
        setSearchInput(value);
        setSearchValue(value);
      }),
    },
    fetchFunction: fetchCategories,
    onFilterAppliedFromUrl: setSearchInput,
  });

  const resetSearchFilter = useCallback(() => {
    setSearchInput("");
    setSearchValue("");
  }, []);

  const filterHandlers = useMemo(
    () => [
      {
        filterId: "name",
        resetValue: resetSearchFilter,
        color: "blue",
      },
    ],
    [resetSearchFilter]
  );

  const activeFilters = useMemo<ActiveFilter[]>(
    () =>
      searchValue
        ? [
            {
              id: "name",
              label: t("admin.categories.columns.name"),
              value: searchValue,
            },
          ]
        : [],
    [searchValue, t]
  );

  const {
    filterIdsConfig,
    filterActionButtons,
    handleRemoveFilter,
    handleClearAllFilters,
  } = useAdminListFilters({
    filterHandlers,
    activeFilters,
    onClearFiltersReady,
  });

  const handleSearch = useCallback(() => {
    setSearchValue(searchInput);
    setPage(1);
  }, [searchInput, setPage]);

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

  const handleEdit = useCallback(
    (category: Category) => openDialog(DIALOG_MODES.EDIT, category),
    [openDialog]
  );

  const handleView = useCallback(
    (category: Category) => openDialog(DIALOG_MODES.VIEW, category),
    [openDialog]
  );

  const handleViewTests = useCallback(
    (category: Category) => {
      const searchParams = new URLSearchParams();
      searchParams.set(FILTER_QUERY_PARAMS.FILTER_KEY(1), "categoryId");
      searchParams.set(FILTER_QUERY_PARAMS.FILTER_VALUE(1), category.id);
      navigate(`${TESTS_ROUTES.INDEX}?${searchParams.toString()}`);
    },
    [navigate]
  );

  const refreshCategoriesList = useCallback(
    async (refreshPage: number, refreshPageSize: number) => {
      await refreshCategories(refreshPage, refreshPageSize);
    },
    [refreshCategories]
  );

  const { actions: baseActions } = useAdminListActions<Category>({
    roles,
    deleteFunction: deleteCategory,
    refreshFunction: refreshCategoriesList,
    successMessageKey: "admin.categories.deleteSuccess",
    deleteTitleKey: "admin.categories.delete",
    confirmDeleteKey: "admin.categories.confirmDelete",
    deleteButtonKey: "admin.categories.delete",
    onEdit: handleEdit,
    onView: handleView,
    onClearFilters: handleClearAllFilters,
    getItemName: (category) => category.name,
    confirmDeleteParams: (category) => ({ name: category.name }),
  });

  const actions = useMemo(() => {
    const result = [...baseActions];
    if (roles.read) {
      result.push({
        label: t("admin.categories.viewTests"),
        onClick: handleViewTests,
        icon: <List className="h-4 w-4" />,
        className:
          "border-purple-500/50 text-purple-600 hover:bg-gradient-to-br hover:from-purple-500 hover:to-violet-600 hover:text-white hover:border-purple-600 dark:border-purple-400/50 dark:text-purple-400 dark:hover:from-purple-600 dark:hover:to-violet-700 dark:hover:border-purple-500",
        actionType: "default" as const,
      });
    }
    return result;
  }, [baseActions, roles, t, handleViewTests]);

  const columns = useMemo<Column<Category>[]>(
    () => [
      {
        key: "id",
        header: t("admin.categories.columns.id"),
        className: "w-[100px]",
        render: (category) => (
          <span className="truncate block max-w-[100px]" title={category.id}>
            {category.id}
          </span>
        ),
      },
      {
        key: "name",
        header: t("admin.categories.columns.name"),
        render: (category) => (
          <span className="font-medium">{category.name}</span>
        ),
      },
      {
        key: "questionCount",
        header: t("admin.categories.columns.questionCount"),
        meta: { center: true },
        render: (category) => (
          <span className="text-muted-foreground">
            {category.questionCount ?? 0}
          </span>
        ),
      },
    ],
    [t]
  );

  const handleRefresh = useCallback(async () => {
    await refreshCategories(page, pageSize, apiFilters);
  }, [refreshCategories, page, pageSize, apiFilters]);

  // Show skeleton on initial load
  if (loading && categories.length === 0 && !hasInitialFetch.current) {
    return (
      <>
        <CategoriesListSkeleton />
      </>
    );
  }

  return (
    <>
      <AdminList
        columns={columns}
        data={categories}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.categories.empty")}
        searchInput={{
          value: searchInput,
          onChange: setSearchInput,
          onSearch: handleSearch,
          placeholderKey: "common.searchPlaceholder",
          className: "flex-1",
          searchKey: "name",
        }}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        filterIdsConfig={filterIdsConfig}
        filterActionButtons={filterActionButtons}
        pagination={paginationProps}
      />
      <CategoryFormDialog onRefresh={handleRefresh} />
    </>
  );
}
