import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { tokenManager, userAPI } from '../utils/api';
import { useTheme } from '../hooks/useTheme';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Test from '../pages/Test';
import Result from '../pages/Result';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // On mount, check if user has valid token
  useEffect(() => {
    const initAuth = async () => {
      if (tokenManager.hasToken()) {
        try {
          const userData = await userAPI.getCurrentUser();
          setUser({
            name: userData.account_name,
            email: userData.user_email,
          });
        } catch (error) {
          console.error('Failed to fetch user:', error);
          tokenManager.removeToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser({
      name: userData.name || userData.email?.split('@')[0] || 'User',
      email: userData.email,
    });
  };

  const handleRegister = (userData) => {
    // After successful registration, user is automatically logged in
    setUser({
      name: userData.name,
      email: userData.email,
    });
  };

  const handleLogout = () => {
    tokenManager.removeToken();
    setUser(null);
  };

  const handleAddResult = (result) => {
    // Results are now tracked in the backend via responses table
    console.log('Test result:', result);
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg text-slate-600">Loading...</div>
        </div>
      );
    }
    return user ? children : <Navigate to="/login" replace />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/profile" : "/login"} replace />} />
      <Route path="/login" element={<Login user={user} onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />} />
      <Route path="/register" element={<Register onRegister={handleRegister} theme={theme} onToggleTheme={toggleTheme} />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test"
        element={
          <ProtectedRoute>
            <Test theme={theme} onToggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/result"
        element={
          <ProtectedRoute>
            <Result onAddResult={handleAddResult} theme={theme} onToggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to={user ? "/profile" : "/login"} replace />} />
    </Routes>
  );
}
