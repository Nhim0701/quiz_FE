import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "@/i18n";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { RESOURCES } from "@/constants/permissions";
import { ROUTES } from "@/constants";
import { useTestsStore, type TestProps } from "../hooks";
import { useCategoriesStore } from "../../categories/hooks";
import { Container } from "@/components/ui/container";
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
import { formatUnixTimestamp } from "@/lib";
import { useApp, useBreadcrumb } from "@/hooks";
import { PageHeader } from "@/components/page-header";

export default function AdminTestInfo() {
  const { t } = useTranslation();
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { getNamespaceRoles } = useRole();
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
      <Container>
        <PageHeader title={t("admin.tests.info.title")} />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {t("admin.tests.noPermission")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (loading) {
    return <Loading message={t("admin.tests.info.loading")} />;
  }

  if (!test) {
    return (
      <Container>
        <PageHeader title={t("admin.tests.info.title")} />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {t("admin.tests.info.notFound")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="p-2">
      <PageHeader title={test.name || t("admin.tests.info.title")} />
      <div className="space-y-6">
        {/* Test Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              {t("admin.tests.info.cardTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("admin.tests.info.fields.name")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {test.name}
                    </span>
                  </div>
                </div>

                {/* ID */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("admin.tests.info.fields.id")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {test.id}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("admin.tests.info.fields.category")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {categoryName}
                    </span>
                  </div>
                </div>

                {/* Time Limit */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("admin.tests.info.fields.timeLimit")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {test.timeLimit} {t("common.minutes")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Question Count */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("admin.tests.info.fields.questionCount")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {test.questionCount ?? 0}
                    </span>
                  </div>
                </div>

                {/* Created At */}
                {test.createdAt && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t("admin.tests.info.fields.createdAt")}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {formatUnixTimestamp(
                          typeof test.createdAt === "string"
                            ? parseInt(test.createdAt)
                            : test.createdAt
                        ) || "-"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Updated At */}
                {test.updatedAt && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t("admin.tests.info.fields.updatedAt")}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {formatUnixTimestamp(
                          typeof test.updatedAt === "string"
                            ? parseInt(test.updatedAt)
                            : test.updatedAt
                        ) || "-"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t("admin.tests.info.fields.description")}
                </h3>
                <div className="flex items-start gap-2">
                  <List className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {test.description || t("admin.tests.info.noDescription")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
