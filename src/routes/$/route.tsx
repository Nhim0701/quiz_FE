import { Navigate } from "react-router-dom";

export default function CatchAll() {
  return <Navigate to="/dashboard" replace />;
}

