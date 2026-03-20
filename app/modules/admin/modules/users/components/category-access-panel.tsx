import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "@/i18n";
import { useApp } from "@/hooks";
import { apiClient } from "@/lib";
import type { ApiSuccessResponse } from "@/types";
import { ENDPOINTS } from "../constants";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/common/combobox";
import { Loader2, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CategoryAccess {
  categoryId: string;
  categoryName?: string;
}

interface Category {
  id: string;
  name: string;
}

interface CategoryAccessPanelProps {
  userId: string;
}

export function CategoryAccessPanel({ userId }: CategoryAccessPanelProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();

  const [grantedAccess, setGrantedAccess] = useState<CategoryAccess[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [granting, setGranting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const fetchAccess = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<ApiSuccessResponse<CategoryAccess[]>>(
        ENDPOINTS.CATEGORY_ACCESS(userId)
      );
      setGrantedAccess(response.data.data || []);
    } catch {
      // silently fail — access list will be empty
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiSuccessResponse<Category[]>>(
        "/api/v1/categories",
        { params: { page: 1, pageSize: 100 } }
      );
      setAllCategories(response.data.data || []);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchAccess();
    fetchCategories();
  }, [fetchAccess, fetchCategories]);

  const grantedIds = useMemo(
    () => new Set(grantedAccess.map((a) => a.categoryId)),
    [grantedAccess]
  );

  const availableOptions = useMemo(
    () =>
      allCategories
        .filter((c) => !grantedIds.has(c.id))
        .map((c) => ({ value: c.id, label: c.name })),
    [allCategories, grantedIds]
  );

  const handleGrant = useCallback(async () => {
    if (!selectedCategoryId) return;
    setGranting(true);
    try {
      await apiClient.post(ENDPOINTS.CATEGORY_ACCESS(userId), {
        categoryId: selectedCategoryId,
      });
      showSuccess(t("admin.users.categoryAccess.grantSuccess"));
      setSelectedCategoryId("");
      await fetchAccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    } finally {
      setGranting(false);
    }
  }, [selectedCategoryId, userId, showSuccess, showError, t, fetchAccess]);

  const handleRevoke = useCallback(
    async (categoryId: string) => {
      try {
        await apiClient.delete(ENDPOINTS.CATEGORY_ACCESS_DELETE(userId, categoryId));
        showSuccess(t("admin.users.categoryAccess.revokeSuccess"));
        await fetchAccess();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      }
    },
    [userId, showSuccess, showError, t, fetchAccess]
  );

  return (
    <div className="space-y-4">
      <Separator />
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {t("admin.users.categoryAccess.title")}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {t("admin.users.categoryAccess.description")}
        </p>

        {/* Grant section */}
        <div className="flex items-center gap-2 mb-4">
          <Combobox
            mode="single"
            options={availableOptions}
            value={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            placeholder={t("admin.users.categoryAccess.selectCategory")}
            searchPlaceholder={t("admin.users.categoryAccess.searchCategory")}
            emptyMessage={t("admin.users.categoryAccess.noCategories")}
            disabled={granting || loading}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleGrant}
            disabled={!selectedCategoryId || granting || loading}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shrink-0"
          >
            {granting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("admin.users.categoryAccess.grant")
            )}
          </Button>
        </div>

        {/* Granted access list */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : grantedAccess.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("admin.users.categoryAccess.empty")}
          </p>
        ) : (
          <ul className="space-y-2">
            {grantedAccess.map((access) => {
              const category = allCategories.find((c) => c.id === access.categoryId);
              return (
                <li
                  key={access.categoryId}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="font-medium">
                    {category?.name || access.categoryName || access.categoryId}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRevoke(access.categoryId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
