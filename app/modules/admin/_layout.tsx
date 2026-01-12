import { Outlet } from "react-router";
import type { Route } from "../+types/_layout";
import adminMiddleware from "@/middleware/admin";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  adminMiddleware,
];

export default function Layout() {
  return <Outlet />;
}
