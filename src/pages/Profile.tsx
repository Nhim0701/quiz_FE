import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApp from "../hooks/useApp";
import { useAuth } from "../hooks/useAuth";
import { useProfileStore } from "../hooks/useProfile";
import { ROUTES, ERROR_MESSAGES } from "../constants";
import {
  ProfileHeader,
  ProfileStats,
  ProfileTests,
  ProfileCategoryStats,
  ProfileRecentActivity,
} from "../components/pages/profile";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setLoading, showError } = useApp();
  const {
    dashboardData,
    categoriesWithSets,
    getDashboard,
    getCategoriesWithSets,
  } = useProfileStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([getCategoriesWithSets(), getDashboard()]);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.FETCH_DASHBOARD_FAILED;
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setLoading, getCategoriesWithSets, getDashboard, showError]);

  const handleStartTest = (category: string, questionSet: string) => {
    navigate(ROUTES.TEST, {
      state: {
        category,
        questionSet,
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <ProfileHeader
          userName={user?.name}
          userEmail={user?.email}
          onLogout={handleLogout}
        />

        {dashboardData?.overall && (
          <ProfileStats overall={dashboardData.overall} />
        )}

        <div className="space-y-4 sm:space-y-6">
          <ProfileTests
            categoriesWithSets={categoriesWithSets}
            onStartTest={handleStartTest}
          />

          {dashboardData?.by_category && (
            <ProfileCategoryStats byCategory={dashboardData.by_category} />
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {dashboardData?.recent_activity && (
            <ProfileRecentActivity
              recentActivity={dashboardData.recent_activity}
            />
          )}
        </div>
      </div>
    </div>
  );
}
