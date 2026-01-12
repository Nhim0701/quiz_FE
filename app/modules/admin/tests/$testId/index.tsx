import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "@/i18n";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { RESOURCES } from "@/constants/permissions";
import { ROUTES } from "@/constants";
import { useAdminLayout } from "../../_layout";
import { useTestsStore, type TestProps } from "@/hooks/use-tests";
import { useCategoriesStore } from "@/hooks/use-categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/ui/loading";
import {
  FileText,
  FolderTree,
  Clock,
  Hash,
  Calendar,
  ArrowLeft,
  List,
} from "lucide-react";
import { formatUnixTimestamp } from "@/lib/utils";
import useApp from "@/hooks/use-app";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";

export default function AdminTestInfo() {
  const { t } = useTranslation();
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { getNamespaceRoles } = useRole();
  const { setConfig } = useAdminLayout();
  const { showError } = useApp();

  const roles = getNamespaceRoles(RESOURCES.TEST);
  const { getTestById } = useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  const [test, setTest] = useState<TestProps | null>(null);
  const [loading, setLoading] = useState(true);

  // Set breadcrumb
  useBreadcrumb(
    [
      {
        label: t("sidebar.admin.index"),
        href: ROUTES.ADMIN.INDEX,
      },
      {
        label: t("sidebar.admin.tests"),
        href: ROUTES.ADMIN.TESTS,
      },
      {
        label: test?.name || t("admin.tests.info.title"),
        href: testId ? ROUTES.ADMIN.TEST_INFO(testId) : ROUTES.ADMIN.TESTS,
      },
    ],
    [test, testId, t]
  );

  useEffect(() => {
    setConfig({
      resource: RESOURCES.TEST,
      titleKey: "admin.tests.info.title",
      cardTitleKey: "admin.tests.info.cardTitle",
      createKey: "admin.tests.createTitle",
      showCreateButton: false,
      noPermissionMessage: t("admin.tests.noPermission"),
    });
  }, [setConfig, t]);

  useEffect(() => {
    const loadTest = async () => {
      if (!testId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const testData = await getTestById(testId);
        if (!testData) {
          showError(t("admin.tests.info.notFound"));
          navigate(ROUTES.ADMIN.TESTS);
          return;
        }
        setTest(testData);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId, getTestById, showError, t, navigate]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        await fetchCategories(1, 1000);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();
  }, [fetchCategories]);

  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name])
  );

  const categoryName =
    test?.categoryName ||
    categoryMap.get(test?.categoryId || "") ||
    test?.categoryId ||
    "-";

  if (!roles.read) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            {t("admin.tests.noPermission")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <Loading message={t("admin.tests.info.loading")} />;
  }

  if (!test) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            {t("admin.tests.info.notFound")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.ADMIN.TESTS)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("admin.tests.info.backToList")}
        </Button>
      </div>

      {/* Test Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("admin.tests.info.cardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("admin.tests.info.fields.name")}
            </h3>
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-base font-medium text-slate-800 dark:text-slate-100">
                {test.name}
              </span>
            </div>
          </div>

          <Separator />

          {/* ID */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("admin.tests.info.fields.id")}
            </h3>
            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                {test.id}
              </span>
            </div>
          </div>

          <Separator />

          {/* Category */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("admin.tests.info.fields.category")}
            </h3>
            <div className="flex items-center gap-3">
              <FolderTree className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {categoryName}
              </span>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("admin.tests.info.fields.description")}
            </h3>
            <div className="flex items-start gap-3">
              <List className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {test.description || t("admin.tests.info.noDescription")}
              </span>
            </div>
          </div>

          <Separator />

          {/* Time Limit */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("admin.tests.info.fields.timeLimit")}
            </h3>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {test.timeLimit} {t("common.minutes")}
              </span>
            </div>
          </div>

          <Separator />

          {/* Question Count */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("admin.tests.info.fields.questionCount")}
            </h3>
            <div className="flex items-center gap-3">
              <List className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {test.questionCount ?? 0}
              </span>
            </div>
          </div>

          {/* Timestamps */}
          {(test.createdAt || test.updatedAt) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("admin.tests.info.fields.createdAt")}
                </h3>
                {test.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formatUnixTimestamp(
                        typeof test.createdAt === "string"
                          ? parseInt(test.createdAt)
                          : test.createdAt
                      ) || "-"}
                    </span>
                  </div>
                )}
                {test.updatedAt && (
                  <>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-4">
                      {t("admin.tests.info.fields.updatedAt")}
                    </h3>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {formatUnixTimestamp(
                          typeof test.updatedAt === "string"
                            ? parseInt(test.updatedAt)
                            : test.updatedAt
                        ) || "-"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
