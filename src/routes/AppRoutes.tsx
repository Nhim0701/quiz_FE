import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Test from "../pages/Test";
import Result from "../pages/Result";
import ProtectedRoute from "../components/ProtectedRoute";

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
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test"
        element={
          <ProtectedRoute>
            <Test />
          </ProtectedRoute>
        }
      />
      <Route
        path="/result"
        element={
          <ProtectedRoute>
            <Result />
          </ProtectedRoute>
        }
      />

      {/* Fallback for unknown routes */}
      <Route
        path="*"
        element={<Navigate to={user ? "/profile" : "/login"} replace />}
      />
    </Routes>
  );
}
