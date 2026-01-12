import { useEffect } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "@/i18n";
import {
  DataTable,
  Pagination,
  type Column,
  type Action,
} from "@/components/common/data-table";
import { usePaginationStore } from "@/hooks/usePagination";
import { useCategoriesStore, type Category } from "@/hooks/useCategories";
import { Edit, Trash2 } from "lucide-react";
import useApp from "@/hooks/useApp";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export function CategoriesList() {
  const { t } = useTranslation();
  const location = useLocation();
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

  // Reset pagination when route changes (but keep when same route)
  useEffect(() => {
    // Get route without query params for comparison
    const routePath = location.pathname;
    setCurrentRoute(routePath);
  }, [location.pathname, setCurrentRoute]);
  const {
    categories,
    loading,
    fetchCategories,
    openSheet,
    deleteCategory,
    refreshCategories,
  } = useCategoriesStore();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await fetchCategories(page, pageSize);
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
      }
    };

    loadCategories();
  }, [page, pageSize, fetchCategories, setTotal, showError, t]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const handleEdit = (category: Category) => {
    openSheet(category);
  };

  const handleDelete = (category: Category) => {
    const confirmDelete = async () => {
      try {
        await deleteCategory(category.id);
        showSuccess(t("admin.categories.deleteSuccess"));
        await refreshCategories(page, pageSize);
        closeDialog();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      }
    };

    showDialog({
      title: t("admin.categories.delete"),
      content: (
        <AlertDialogDescription>
          {t("admin.categories.confirmDelete", {
            name: category.name,
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
            {t("admin.categories.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      ),
    });
  };

  const columns: Column<Category>[] = [
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
      header: t("admin.categories.columns.questionCount" as any),
      meta: { center: true },
      render: (category) => (
        <span className="text-muted-foreground">
          {category.questionCount ?? 0}
        </span>
      ),
    },
  ];

  const actions: Action<Category>[] = [
    {
      label: t("common.edit"),
      onClick: handleEdit,
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: t("admin.categories.delete"),
      onClick: handleDelete,
      variant: "destructive",
      icon: <Trash2 className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={categories}
        actions={actions}
        loading={loading}
        emptyMessage={t("admin.categories.empty")}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
}
