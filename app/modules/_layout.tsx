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
    <SidebarProvider className="w-screen h-screen overflow-x-hidden bg-background">
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="h-full w-full bg-background p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
