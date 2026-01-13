import { Outlet, useLocation, useOutletContext } from "react-router";
import type { Route } from "../+types/_layout";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { useTranslation, type TranslationKey } from "@/i18n";
import { useBreadcrumb } from "@/hooks";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { ROUTES } from "@/constants";
import { RESOURCES } from "@/constants/permissions";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import adminMiddleware from "@/modules/admin/_middleware";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  adminMiddleware,
];

export interface AdminLayoutConfig {
  resource: typeof RESOURCES.CATEGORY | typeof RESOURCES.TEST;
  titleKey: string;
  cardTitleKey: string;
  createKey: string;
  onCreate?: () => void;
  showCreateButton?: boolean;
  noPermissionMessage?: string;
  cardContentClassName?: string;
  footer?: ReactNode;
}

export function useAdminLayout() {
  return useOutletContext<{
    setConfig: (config: AdminLayoutConfig) => void;
  }>();
}

export default function Layout() {
  const { t } = useTranslation();
  const { getNamespaceRoles } = useRole();
  const location = useLocation();
  const [config, setConfigState] = useState<AdminLayoutConfig | null>(null);

  // Stable setConfig function
  const setConfig = useCallback((newConfig: AdminLayoutConfig) => {
    setConfigState(newConfig);
  }, []);

  // Auto-detect resource from route
  const detectedResource =
    location.pathname === ROUTES.ADMIN.CATEGORIES
      ? RESOURCES.CATEGORY
      : location.pathname === ROUTES.ADMIN.TESTS
        ? RESOURCES.TEST
        : null;

  const resource = config?.resource || detectedResource;

  if (!resource) {
    return <Outlet />;
  }

  const roles = getNamespaceRoles(resource);

  const breadcrumbLabel =
    resource === RESOURCES.CATEGORY
      ? "sidebar.admin.categories"
      : "sidebar.admin.tests";

  const breadcrumbs = useMemo(
    () => [
      {
        label: t("sidebar.admin.index"),
        href: ROUTES.ADMIN.INDEX,
      },
      {
        label: t(breadcrumbLabel),
        href:
          resource === RESOURCES.CATEGORY
            ? ROUTES.ADMIN.CATEGORIES
            : ROUTES.ADMIN.TESTS,
      },
    ],
    [t, breadcrumbLabel, resource]
  );

  useBreadcrumb(breadcrumbs, [t, breadcrumbLabel, resource]);

  // Reset config when route changes (but not on initial mount)
  const prevPathnameRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      prevPathnameRef.current !== null &&
      prevPathnameRef.current !== location.pathname
    ) {
      setConfigState(() => null);
    }
    prevPathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Create default config based on detected resource if config is not set
  const defaultConfig: AdminLayoutConfig | null =
    !config && detectedResource
      ? {
          resource: detectedResource,
          titleKey:
            detectedResource === RESOURCES.CATEGORY
              ? "admin.categories.title"
              : "admin.tests.title",
          cardTitleKey:
            detectedResource === RESOURCES.CATEGORY
              ? "admin.categories.cardTitle"
              : "admin.tests.cardTitle",
          createKey:
            detectedResource === RESOURCES.CATEGORY
              ? "admin.categories.create"
              : "admin.tests.create",
        }
      : null;

  const displayConfig = config || defaultConfig;

  if (!roles.read) {
    return (
      <Container>
        <PageHeader
          title={
            displayConfig?.titleKey
              ? t(displayConfig.titleKey as TranslationKey)
              : t("admin.common.noPermission")
          }
        />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {displayConfig?.noPermissionMessage ||
                t("admin.common.noPermission")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="p-2">
      {displayConfig ? (
        <>
          <PageHeader title={t(displayConfig.titleKey as TranslationKey)} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>
                {t(displayConfig.cardTitleKey as TranslationKey)}
              </CardTitle>
              {roles.create &&
                config &&
                config.onCreate &&
                config.showCreateButton !== false && (
                  <Button
                    onClick={config.onCreate}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t(displayConfig.createKey as TranslationKey)}
                  </Button>
                )}
            </CardHeader>
            <CardContent className={displayConfig.cardContentClassName}>
              <Outlet context={{ setConfig }} />
            </CardContent>
          </Card>
          {displayConfig.footer && (
            <div className="mt-4">{displayConfig.footer}</div>
          )}
        </>
      ) : (
        <Outlet context={{ setConfig }} />
      )}
    </Container>
  );
}
