import { Outlet, useLocation, useOutletContext } from "react-router";
import type { Route } from "../+types/_layout";
import { useState, useEffect, type ReactNode } from "react";
import { useTranslation, type TranslationKey } from "@/i18n";
import { useBreadcrumb } from "@/hooks/useApp";
import { useRole } from "@/hooks/useRole";
import { ROUTES } from "@/constants";
import { RESOURCES } from "@/constants/permissions";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import adminMiddleware from "@/middleware/admin";

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
  const [config, setConfig] = useState<AdminLayoutConfig | null>(null);

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

  useBreadcrumb([
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
  ]);

  // Reset config when route changes
  useEffect(() => {
    setConfig(null);
  }, [location.pathname]);

  if (!roles.read) {
    return (
      <Container>
        <PageHeader
          title={
            config?.titleKey
              ? t(config.titleKey as TranslationKey)
              : t("admin.common.noPermission")
          }
        />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {config?.noPermissionMessage || t("admin.common.noPermission")}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      {config ? (
        <>
          <PageHeader title={t(config.titleKey as TranslationKey)} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{t(config.cardTitleKey as TranslationKey)}</CardTitle>
              {config.showCreateButton !== false &&
                roles.create &&
                config.onCreate && (
                  <Button
                    onClick={config.onCreate}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t(config.createKey as TranslationKey)}
                  </Button>
                )}
            </CardHeader>
            <CardContent className={config.cardContentClassName}>
              <Outlet context={{ setConfig }} />
            </CardContent>
          </Card>
          {config.footer && <div className="mt-4">{config.footer}</div>}
        </>
      ) : (
        <Outlet context={{ setConfig }} />
      )}
    </Container>
  );
}
