import { Outlet } from "react-router";
import type { Route } from "./+types/_layout";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import authMiddleware from "@/middleware/auth";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  authMiddleware,
];

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
