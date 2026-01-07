import { ROUTES } from "@/constants";
import { Navigate } from "react-router";

export default function CatchAll() {
  return <Navigate to={ROUTES.DASHBOARD} replace />;
}
