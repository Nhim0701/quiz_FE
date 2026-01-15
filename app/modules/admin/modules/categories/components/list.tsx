import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation, type TranslationParams } from "@/i18n";
import { DIALOG_MODES } from "@/constants";
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
  createStringFilterHandler,
  useAdminListData,
} from "@/hooks";
import { useCategoriesStore, type Category } from "../hooks";
import { Edit, Trash2, Eye, List } from "lucide-react";
import { CategoryFormDialog } from "./form-dialog";
import { CategoriesListSkeleton } from "./list-skeleton";
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
  type ActiveFilter,
} from "@/components/common/filters";
import { ROUTES as TESTS_ROUTES } from "../../tests/constants";
import { FILTER_QUERY_PARAMS } from "@/constants/filters";

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
  const { showError, showSuccess, showDialog, closeDialog } = useApp();
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
      },
    ],
    [resetSearchFilter]
  );

  const handleFilterChange = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers({
    handlers: filterHandlers,
    onFilterChange: handleFilterChange,
  });

  useEffect(() => {
    if (onClearFiltersReady) {
      onClearFiltersReady(handleClearAllFilters);
    }
  }, [onClearFiltersReady, handleClearAllFilters]);

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

  const filterIdsConfig = useFilterIdsConfig({
    handlers: filterHandlers,
    colorMap: {
      name: "blue",
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

  const handleDelete = useCallback(
    (category: Category) => {
      const confirmDelete = async () => {
        try {
          await deleteCategory(category.id);
          showSuccess(t("admin.categories.deleteSuccess"));
          handleClearAllFilters();
          await refreshCategories(1, pageSize);
          closeDialog();
        } catch (error) {
          showError(
            error instanceof Error ? error.message : t("errors.genericError")
          );
        }
      };

      showDialog({
        title: t("admin.categories.delete"),
        content: (
          <AlertDialogDescription>
            {t("admin.categories.confirmDelete", {
              name: category.name,
            } as TranslationParams<"admin.categories.confirmDelete">)}
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
              {t("admin.categories.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        ),
      });
    },
    [
      deleteCategory,
      showSuccess,
      t,
      handleClearAllFilters,
      refreshCategories,
      pageSize,
      closeDialog,
      showDialog,
      showError,
    ]
  );

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

  const actions = useMemo<Action<Category>[]>(
    () => [
      ...(roles.read
        ? [
            {
              label: t("admin.categories.viewInfo"),
              onClick: handleView,
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
              label: t("admin.categories.delete"),
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
              label: t("admin.categories.viewTests"),
              onClick: handleViewTests,
              icon: <List className="h-4 w-4" />,
              className:
                "border-purple-500/50 text-purple-600 hover:bg-gradient-to-br hover:from-purple-500 hover:to-violet-600 hover:text-white hover:border-purple-600 dark:border-purple-400/50 dark:text-purple-400 dark:hover:from-purple-600 dark:hover:to-violet-700 dark:hover:border-purple-500",
              actionType: "default" as const,
            },
          ]
        : []),
    ],
    [roles, t, handleView, handleEdit, handleDelete, handleViewTests]
  );

  // Show skeleton on initial load
  if (loading && categories.length === 0 && !hasInitialFetch.current) {
    return (
      <>
        <CategoriesListSkeleton />
        <CategoryFormDialog onDelete={handleDelete} />
      </>
    );
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            placeholderKey="common.searchPlaceholder"
            className="flex-1"
            searchKey="name"
          />
          <FilterActions buttons={filterActionButtons} />
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4">
          <ActiveFilters
            filters={activeFilters}
            onRemove={handleRemoveFilter}
            filterIdsConfig={filterIdsConfig}
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={categories}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.categories.empty")}
        pagination={paginationProps}
      />
      <CategoryFormDialog onDelete={handleDelete} />
    </>
  );
}
