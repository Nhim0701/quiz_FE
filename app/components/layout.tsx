import { Outlet } from "react-router";
import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider, useSidebar } from "./ui/sidebar";
import { AppHeader } from "./app-header";

function LayoutContent() {
  const { state, isMobile } = useSidebar();

  return (
    <SidebarInset>
      <AppHeader />
      <div
        className="h-full w-full transition-all duration-200"
        style={{
          maxWidth: !isMobile
            ? state === "collapsed"
              ? "calc(100vw - var(--sidebar-width-icon) - 1.5rem)"
              : "calc(100vw - var(--sidebar-width))"
            : "100%",
          marginLeft: !isMobile
            ? state === "collapsed"
              ? "calc(var(--sidebar-width-icon) + 1.5rem)"
              : "calc(var(--sidebar-width))"
            : 0,
        }}
      >
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 h-full w-full">
          <Outlet />
        </div>
      </div>
    </SidebarInset>
  );
}

export function Layout() {
  return (
    <div className="w-screen h-screen overflow-x-hidden">
      <SidebarProvider>
        <AppSidebar />
        <LayoutContent />
      </SidebarProvider>
    </div>
  );
}
