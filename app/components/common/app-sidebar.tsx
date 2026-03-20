import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  FolderTree,
  HelpCircle,
  Shield,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/modules/common/auth/hooks/use-auth";
import { useRole } from "@/modules/common/auth/hooks/use-role";
import { useNavigate, useLocation, Link } from "react-router";
import {
  COMMON_PERMISSIONS,
  RESOURCES,
} from "@/modules/admin/constants/permissions";
import { getInitials } from "@/lib";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ROUTES as AUTH_ROUTES } from "@/modules/common/auth/constants";
import { ROUTES as DASHBOARD_ROUTES } from "@/modules/user/modules/dashboard/constants";
import { ROUTES as PROFILE_ROUTES } from "@/modules/user/modules/profile/constants";
import { ROUTES as TESTS_ROUTES } from "@/modules/user/modules/tests/constants";
import { ROUTES as ADMIN_CATEGORIES_ROUTES } from "@/modules/admin/modules/categories/constants";
import { ROUTES as ADMIN_TESTS_ROUTES } from "@/modules/admin/modules/tests/constants";
import { ROUTES as ADMIN_QUESTIONS_ROUTES } from "@/modules/admin/modules/questions/constants";
import { ROUTES as ADMIN_USERS_ROUTES } from "@/modules/admin/modules/users/constants";
import { ROUTES as ADMIN_ROLES_ROUTES } from "@/modules/admin/modules/roles/constants";
import { ROUTES as ADMIN_PERMISSIONS_ROUTES } from "@/modules/admin/modules/permissions/constants";
import { ROUTES as ADMIN_NAMESPACES_ROUTES } from "@/modules/admin/modules/namespaces/constants";
import { ROUTES as ADMIN_TEST_ASSIGNMENTS_ROUTES } from "@/modules/admin/modules/test-assignments/constants";

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

  // User menu items - always visible to authenticated users
  // These are basic features that don't require specific permissions
  const menuItems = [
    {
      title: t("sidebar.dashboard"),
      icon: LayoutDashboard,
      url: DASHBOARD_ROUTES.INDEX,
    },
    {
      title: t("sidebar.tests"),
      icon: FileText,
      url: TESTS_ROUTES.INDEX,
    },
    {
      title: t("sidebar.profile"),
      icon: User,
      url: PROFILE_ROUTES.INDEX,
    },
  ];

  // Users with the "user" role never see the admin menu
  const isUserRole = user?.roleName === "user";

  // Check if user has roles permission
  const hasRolesPermission =
    !isUserRole &&
    (hasPermission(COMMON_PERMISSIONS.ROLE_READ) ||
      hasResourcePermission(RESOURCES.ROLES));

  // Admin-only menu items with permission checks
  const adminMenuItems = isUserRole
    ? []
    : [
    {
      title: t("sidebar.admin.categories"),
      icon: FolderTree,
      url: ADMIN_CATEGORIES_ROUTES.INDEX,
      permission: COMMON_PERMISSIONS.CATEGORY_READ,
      resourcePrefix: RESOURCES.CATEGORY,
    },
    {
      title: t("sidebar.admin.tests"),
      icon: FileText,
      url: ADMIN_TESTS_ROUTES.INDEX,
      permission: COMMON_PERMISSIONS.TEST_READ,
      resourcePrefix: RESOURCES.TEST,
    },
    {
      title: t("sidebar.admin.questions"),
      icon: HelpCircle,
      url: ADMIN_QUESTIONS_ROUTES.INDEX,
      permission: COMMON_PERMISSIONS.QUESTION_READ,
      resourcePrefix: RESOURCES.QUESTION,
    },
    {
      title: t("sidebar.admin.users"),
      icon: User,
      url: ADMIN_USERS_ROUTES.INDEX,
      permission: COMMON_PERMISSIONS.USER_READ,
      resourcePrefix: RESOURCES.USER,
    },
    {
      title: t("sidebar.admin.testAssignments"),
      icon: ClipboardList,
      url: ADMIN_TEST_ASSIGNMENTS_ROUTES.INDEX,
      permission: COMMON_PERMISSIONS.TEST_ASSIGNMENT_READ,
      resourcePrefix: RESOURCES.TEST_ASSIGNMENT,
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
                const isActive =
                  location.pathname === item.url ||
                  location.pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/15 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-500 dark:border-indigo-400 shadow-sm"
                          : ""
                      }
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
        {(adminMenuItems.length > 0 || hasRolesPermission) && (
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
                    const isActive =
                      location.pathname === item.url ||
                      location.pathname.startsWith(item.url + "/");
                    return (
                      <SidebarMenuItem key={item.url as string}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          className={
                            isActive
                              ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/15 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-500 dark:border-indigo-400 shadow-sm"
                              : ""
                          }
                        >
                          <Link to={item.url as string}>
                            <Icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                  {/* Roles & Permission with sub items */}
                  {hasRolesPermission && (
                    <Collapsible
                      asChild
                      defaultOpen
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={t("sidebar.admin.rolesPermissions")}
                            className={
                              location.pathname.startsWith(
                                ADMIN_ROLES_ROUTES.INDEX
                              ) ||
                              location.pathname.startsWith(
                                ADMIN_PERMISSIONS_ROUTES.INDEX
                              )
                                ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/15 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-500 dark:border-indigo-400 shadow-sm"
                                : ""
                            }
                          >
                            <Shield />
                            <span>{t("sidebar.admin.rolesPermissions")}</span>
                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={
                                  location.pathname ===
                                    ADMIN_ROLES_ROUTES.INDEX ||
                                  location.pathname.startsWith(
                                    ADMIN_ROLES_ROUTES.INDEX + "/"
                                  )
                                }
                              >
                                <Link to={ADMIN_ROLES_ROUTES.INDEX}>
                                  <span>{t("sidebar.admin.roles")}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={
                                  location.pathname ===
                                    ADMIN_PERMISSIONS_ROUTES.INDEX ||
                                  location.pathname.startsWith(
                                    ADMIN_PERMISSIONS_ROUTES.INDEX + "/"
                                  )
                                }
                              >
                                <Link to={ADMIN_PERMISSIONS_ROUTES.INDEX}>
                                  <span>{t("sidebar.admin.permissions")}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={
                                  location.pathname ===
                                    ADMIN_NAMESPACES_ROUTES.INDEX ||
                                  location.pathname.startsWith(
                                    ADMIN_NAMESPACES_ROUTES.INDEX + "/"
                                  )
                                }
                              >
                                <Link to={ADMIN_NAMESPACES_ROUTES.INDEX}>
                                  <span>{t("sidebar.admin.namespaces")}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )}
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
