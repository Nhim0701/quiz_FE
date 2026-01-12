import { useLocation, Link } from "react-router";
import { Separator } from "./ui/separator";
import { LanguageSwitcher } from "./ui/language-switcher";
import ThemeToggle from "./ui/theme-toggle";
import { useSidebar } from "./ui/sidebar";
import { SquareChevronLeftIcon, SquareChevronRightIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { useTranslation } from "@/i18n";
import { ROUTES } from "@/constants";
import useApp from "@/hooks/useApp";

const SidebarTriggerIcon = ({
  state,
  toggleSidebar,
}: {
  state: "expanded" | "collapsed";
  toggleSidebar: () => void;
}) => {
  return state === "expanded" ? (
    <SquareChevronLeftIcon
      onClick={toggleSidebar}
      strokeWidth={1.5}
      className="text-muted-foreground"
    />
  ) : (
    <SquareChevronRightIcon
      onClick={toggleSidebar}
      strokeWidth={1.5}
      className="text-muted-foreground"
    />
  );
};

export function AppHeader() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { t } = useTranslation();
  const { breadcrumbs: storeBreadcrumbs } = useApp();

  // Generate breadcrumb from pathname as fallback if page doesn't set breadcrumb
  const generateBreadcrumbs = () => {
    const pathname = location.pathname;
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: Array<{ label: string; href: string }> = [];

    // Handle home page
    if (pathname === ROUTES.HOME || pathname === ROUTES.DASHBOARD) {
      return [
        {
          label: t("sidebar.dashboard"),
          href: ROUTES.DASHBOARD,
        },
      ];
    }

    // Build breadcrumbs from segments
    let currentPath = "";
    let prevSegment = "";

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;

      // Check if segment is a UUID (dynamic route param)
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          segment
        );

      // Handle dynamic segments (UUIDs)
      if (isUUID) {
        // If previous segment was "tests", add "Test" label
        if (prevSegment === "tests") {
          currentPath += `/${segment}`;
          breadcrumbs.push({
            label: t("sidebar.tests"),
            href: currentPath,
          });
        }
        prevSegment = segment;
        return;
      }

      currentPath += `/${segment}`;
      prevSegment = segment;

      let label = segment;

      // Map segments to translation keys
      if (segment === "admin") {
        label = t("sidebar.admin.index");
      } else if (segment === "categories") {
        label = t("sidebar.admin.categories");
      } else if (segment === "tests") {
        if (currentPath === ROUTES.TESTS.INDEX) {
          label = t("sidebar.tests");
        } else if (currentPath.startsWith(ROUTES.ADMIN.TESTS)) {
          label = t("sidebar.admin.tests");
        } else {
          label = t("sidebar.tests");
        }
      } else if (segment === "profile") {
        label = t("sidebar.profile");
      } else if (segment === "take") {
        label = t("common.take");
      } else if (segment === "result") {
        label = t("common.result");
      } else {
        // Capitalize first letter for unknown segments
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      breadcrumbs.push({
        label,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  // Use store breadcrumbs if available, otherwise fallback to generated
  const breadcrumbs =
    storeBreadcrumbs.length > 0 ? storeBreadcrumbs : generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center gap-2 px-4 flex-1 min-w-0">
        <SidebarTriggerIcon state={state} toggleSidebar={toggleSidebar} />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        {breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <div key={crumb.href} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="flex items-center gap-2 px-4">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
