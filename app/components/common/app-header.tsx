import { Link } from "react-router";
import { Separator } from "../ui/separator";
import { LanguageSwitcher } from "../ui/language-switcher";
import ThemeToggle from "../ui/theme-toggle";
import { useSidebar } from "../ui/sidebar";
import { SquareChevronLeftIcon, SquareChevronRightIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { useBreadcrumbStore } from "@/hooks";

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
  const breadcrumbs = useBreadcrumbStore((state) => state.breadcrumbs);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-10">
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
