import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  FolderTree,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/modules/common/auth/hooks/use-auth";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { useNavigate, useLocation, Link } from "react-router";
import { ROUTES } from "@/constants";
import { COMMON_PERMISSIONS, RESOURCES } from "@/constants/permissions";
import { getInitials } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "./ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { ROUTES as AUTH_ROUTES } from "@/modules/common/auth/constants";
import { ROUTES as DASHBOARD_ROUTES } from "@/modules/user/dashboard/constants";
import { ROUTES as PROFILE_ROUTES } from "@/modules/user/profile/constants";

export function AppSidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isAdmin, hasPermission, hasResourcePermission } = useRole();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = user
    ? user.fullName
      ? getInitials(user.fullName, state === "collapsed" ? 1 : 2)
      : user.email[0]?.toUpperCase() || ""
    : "";

  const handleLogout = async () => {
    await logout();
    navigate(AUTH_ROUTES.LOGIN);
  };

  const menuItems = [
    {
      title: t("sidebar.dashboard"),
      icon: LayoutDashboard,
      url: DASHBOARD_ROUTES.INDEX,
    },
    {
      title: t("sidebar.tests"),
      icon: FileText,
      url: ROUTES.TESTS.INDEX,
    },
    {
      title: t("sidebar.profile"),
      icon: User,
      url: PROFILE_ROUTES.INDEX,
    },
  ];

  // Admin-only menu items with permission checks
  const adminMenuItems = [
    {
      title: t("sidebar.admin.categories"),
      icon: FolderTree,
      url: ROUTES.ADMIN.CATEGORIES,
      permission: COMMON_PERMISSIONS.CATEGORY_READ,
      resourcePrefix: RESOURCES.CATEGORY,
    },
    {
      title: t("sidebar.admin.tests"),
      icon: FileText,
      url: ROUTES.ADMIN.TESTS,
      permission: COMMON_PERMISSIONS.TEST_READ,
      resourcePrefix: RESOURCES.TEST,
    },
  ].filter((item) => {
    if (item.permission === null) {
      return isAdmin();
    }
    // Check if user has the specific permission OR any permission with the resource prefix
    return (
      hasPermission(item.permission) ||
      (item.resourcePrefix ? hasResourcePermission(item.resourcePrefix) : false)
    );
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarContent>
        <SidebarHeader>
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-2 py-1">
                  <div
                    className={`shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center text-white font-bold shadow-lg transition-all duration-200 ease-linear ${
                      state === "collapsed"
                        ? "w-6 h-6 text-xs"
                        : "w-8 h-8 text-sm"
                    }`}
                  >
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
                      {user.fullName}
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
                    <span className="font-medium">{user.fullName}</span>
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
          <SidebarGroupLabel>
            {state === "collapsed" ? null : t("sidebar.userMenu")}
          </SidebarGroupLabel>
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

        {/* Admin Menu - Visible to users with admin permissions */}
        {adminMenuItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>
                {state === "collapsed" ? null : t("sidebar.adminMenu")}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => {
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
          </>
        )}

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
