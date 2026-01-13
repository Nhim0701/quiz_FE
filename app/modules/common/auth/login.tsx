import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/modules/common/auth/hooks/use-auth";
import { SESSION_KEYS } from "@/constants";
import { ROUTES as DASHBOARD_ROUTES } from "@/modules/user/dashboard/constants";
import { LoginHeader, LoginForm, LoginCard, LoginFooter } from "./components";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get destination page from location.state, sessionStorage, or default to /dashboard
  const getRedirectPath = () => {
    // Priority 1: location.state (from ProtectedRoute)
    const fromState = (location.state as { from?: { pathname: string } })?.from
      ?.pathname;
    if (fromState) return fromState;

    // Priority 2: sessionStorage (from 401 redirect)
    const fromSession = sessionStorage.getItem(SESSION_KEYS.REDIRECT_PATH);
    if (fromSession) {
      sessionStorage.removeItem(SESSION_KEYS.REDIRECT_PATH);
      return fromSession;
    }

    // Priority 3: default
    return DASHBOARD_ROUTES.INDEX;
  };

  const from = getRedirectPath();

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  return (
    <>
      <LoginHeader />
      <LoginCard>
        <LoginForm redirectPath={from} />
      </LoginCard>
      <LoginFooter />
    </>
  );
}
