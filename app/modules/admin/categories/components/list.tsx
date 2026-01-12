import { useEffect } from "react";
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
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";
import type { ApiSuccessResponse } from "@/types";
import useApp from "@/hooks/useApp";

export function CategoriesList() {
  const { t } = useTranslation();
  const { setLoading, showError, showSuccess } = useApp();
  const { page, pageSize, total, setPage, setPageSize, setTotal } =
    usePaginationStore();
  const { categories, loading } = useCategoriesStore();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<ApiSuccessResponse<Category[]>>(
          API_ENDPOINTS.CATEGORIES.LIST,
          {
            params: {
              page,
              pageSize,
            },
          }
        );

        const data = response.data.data || [];
        const meta = response.data.meta;

        // Update categories in store (for backward compatibility)
        useCategoriesStore.setState({ categories: data });

        // Update pagination
        if (meta) {
          setTotal(meta.total || 0);
        } else {
          setTotal(data.length);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.fetchDashboardFailed");
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [page, pageSize, setLoading, showError, t, setTotal]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const handleEdit = (category: Category) => {
    // TODO: Implement edit functionality
  };

  const handleDelete = async (category: Category) => {
    if (
      !window.confirm(
        t("admin.categories.confirmDelete", { name: category.name } as any)
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.delete(API_ENDPOINTS.CATEGORIES.GET(category.id));
      showSuccess(t("admin.categories.deleteSuccess"));
      // Refresh categories
      const response = await apiClient.get<ApiSuccessResponse<Category[]>>(
        API_ENDPOINTS.CATEGORIES.LIST,
        {
          params: { page, pageSize },
        }
      );
      const data = response.data.data || [];
      const meta = response.data.meta;
      useCategoriesStore.setState({ categories: data });
      if (meta) {
        setTotal(meta.total || 0);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
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
      {total > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </>
  );
}
