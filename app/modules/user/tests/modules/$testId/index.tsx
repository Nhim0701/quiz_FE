import { Navigate, useParams } from "react-router";
import { ROUTES } from "@/constants";

export default function Test() {
  const { testId } = useParams<{ testId: string }>();
  return <Navigate to={ROUTES.TESTS.TAKE(testId)} replace />;
}
