import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Test from "../pages/Test";
import Result from "../pages/Result";

/**
 * Central app routing + top-level state wiring with JWT authentication.
 *
 * Flow:
 *   /login  -> login form
 *   /register -> registration form
 *   /profile -> user dashboard + test history (protected)
 *   /test    -> take a test (protected)
 *   /result  -> summary screen (protected)
 */
export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={user ? "/profile" : "/login"} replace />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {user ? (
        <>
          <Route path="/profile" element={<Profile />} />
          <Route path="/test" element={<Test />} />
          <Route path="/result" element={<Result />} />
        </>
      ) : (
        <Navigate to="/login" replace />
      )}

      {/* Fallback for unknown routes */}
      <Route
        path="*"
        element={<Navigate to={user ? "/profile" : "/login"} replace />}
      />
    </Routes>
  );
}
