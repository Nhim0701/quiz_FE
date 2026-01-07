import * as React from "react";
import { Link, useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const location = useLocation();
  const { t } = useTranslation();

  // Auto-generate breadcrumbs from path if items not provided
  const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items) return items;

    const pathSegments = location.pathname.split("/").filter(Boolean);

    // If not in app routes, return empty
    if (pathSegments.length === 0 || pathSegments[0] !== "app") {
      return [];
    }

    const generated: BreadcrumbItem[] = [
      { label: t("breadcrumb.home"), href: "/app" },
    ];

    // Map route segments to labels
    const segmentLabels: Record<string, string> = {
      tests: t("sidebar.tests"),
      profile: t("sidebar.profile"),
    };

    let currentPath = "/app";
    pathSegments.forEach((segment, index) => {
      if (segment === "app") {
        return;
      }

      currentPath += `/${segment}`;
      const label = segmentLabels[segment] || segment;
      generated.push({
        label,
        href: index === pathSegments.length - 1 ? undefined : currentPath,
      });
    });

    return generated;
  }, [location.pathname, items, t]);

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground",
        className
      )}
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const isFirst = index === 0;

        return (
          <React.Fragment key={index}>
            {isFirst && (
              <Link
                to={item.href || "#"}
                className="flex items-center hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
              </Link>
            )}
            {!isFirst && (
              <>
                <ChevronRight className="h-4 w-4" />
                {isLast ? (
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href || "#"}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
