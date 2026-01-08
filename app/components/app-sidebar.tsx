import { LayoutDashboard, FileText, User, LogOut } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation, Link } from "react-router";
import { ROUTES } from "@/constants";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "./ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function AppSidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = user
    ? user.name
      ? getInitials(user.name)
      : user.email[0]?.toUpperCase() || ""
    : "";

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const menuItems = [
    {
      title: t("sidebar.dashboard"),
      icon: LayoutDashboard,
      url: ROUTES.DASHBOARD,
    },
    {
      title: t("sidebar.tests"),
      icon: FileText,
      url: ROUTES.TESTS,
    },
    {
      title: t("sidebar.profile"),
      icon: User,
      url: ROUTES.PROFILE,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarContent>
        <SidebarHeader>
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-2 py-1">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {initials}
                  </div>
                  <div
                    className={`flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-200 ease-linear ${
                      state === "collapsed"
                        ? "max-w-0 opacity-0 transition-delay-100"
                        : "max-w-[200px] opacity-100 transition-delay-0"
                    }`}
                    style={{
                      transitionDelay: state === "collapsed" ? "100ms" : "0ms",
                    }}
                  >
                    <span className="text-sm font-medium text-sidebar-foreground truncate whitespace-nowrap">
                      {user.name}
                    </span>
                    <span className="text-xs text-sidebar-foreground/70 truncate whitespace-nowrap">
                      {user.email}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              {state === "collapsed" && (
                <TooltipContent side="right">
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          )}
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip={t("common.logout")}
                >
                  <LogOut />
                  <span>{t("common.logout")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
