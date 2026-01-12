import { useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "@/i18n";
import {
  DataTable,
  Pagination,
  type Column,
  type Action,
} from "@/components/common/data-table";
import { usePaginationStore } from "@/hooks/usePagination";
import { useTestsStore, type TestProps } from "@/hooks/useTests";
import { useCategoriesStore } from "@/hooks/useCategories";
import { Edit, Trash2 } from "lucide-react";
import useApp from "@/hooks/useApp";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { formatUnixTimestamp } from "@/lib/utils";

export function TestsList() {
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
    adminTests: tests,
    adminLoading: loading,
    fetchTests,
    deleteTest,
    refreshTests,
  } = useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  // Fetch categories to map categoryId to categoryName
  useEffect(() => {
    const loadCategories = async () => {
      try {
        await fetchCategories(1, 1000); // Fetch all categories
      } catch (error) {
        // Silently fail - category names are optional
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();
  }, [fetchCategories]);

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

  useEffect(() => {
    const loadTests = async () => {
      try {
        const result = await fetchTests(page, pageSize);
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

    loadTests();
  }, [page, pageSize, fetchTests, setTotal, showError, t]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const handleEdit = (test: TestProps) => {
    // TODO: Implement edit functionality
    console.log("Edit test:", test);
  };

  const handleDelete = (test: TestProps) => {
    const confirmDelete = async () => {
      try {
        await deleteTest(test.id);
        showSuccess(t("admin.tests.deleteSuccess"));
        await refreshTests(page, pageSize);
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

  // Format date helper
  const formatDate = (date: string | number | undefined): string => {
    if (!date) return "-";

    // If it's a number, treat as unix timestamp (in seconds)
    if (typeof date === "number") {
      return formatUnixTimestamp(date) || "-";
    }

    // If it's a string, try to parse it
    if (typeof date === "string") {
      // Try parsing as ISO string first
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        // Convert to unix timestamp (seconds)
        const timestamp = Math.floor(dateObj.getTime() / 1000);
        return formatUnixTimestamp(timestamp) || "-";
      }

      // Try parsing as unix timestamp string
      const timestamp = parseInt(date, 10);
      if (!isNaN(timestamp)) {
        return formatUnixTimestamp(timestamp) || "-";
      }
    }

    return "-";
  };

  const columns: Column<TestProps>[] = [
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
      header: t("admin.tests.columns.questionCount" as any),
      meta: { center: true },
      render: (test) => (
        <span className="text-muted-foreground">{test.questionCount ?? 0}</span>
      ),
    },
    {
      key: "createdAt",
      header: t("admin.tests.columns.createdAt" as any),
      render: (test) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(test.createdAt)}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: t("admin.tests.columns.updatedAt" as any),
      render: (test) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(test.updatedAt)}
        </span>
      ),
    },
  ];

  const actions: Action<TestProps>[] = [
    {
      label: t("common.edit"),
      onClick: handleEdit,
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: t("admin.tests.delete"),
      onClick: handleDelete,
      variant: "destructive",
      icon: <Trash2 className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={testsWithCategoryNames}
        actions={actions}
        loading={loading}
        // scroll={{ maxHeight: 500 }}
        emptyMessage={t("admin.tests.empty")}
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
