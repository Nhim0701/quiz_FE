import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { questionApi, commonApi } from "../utils/api";
import useApp from "../hooks/useApp";
import { useAuth } from "../hooks/useAuth";
import { CategoryWithSetsProps, DashboardProps } from "../types";
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
  const [categoriesWithSets, setCategoriesWithSets] = useState<
    CategoryWithSetsProps[]
  >([]);
  const [dashboardData, setDashboardData] = useState<DashboardProps | null>(
    null
  );
  const { setLoading } = useApp();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesData = await questionApi.getCategoriesWithSets<
          CategoryWithSetsProps[]
        >();
        const dashboard = await commonApi.getDashboard<DashboardProps>();
        setCategoriesWithSets(categoriesData);
        setDashboardData(dashboard);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set empty arrays to avoid undefined errors
        setCategoriesWithSets([]);
        setDashboardData({
          overall: {
            total_answered: 0,
            total_correct: 0,
            total_wrong: 0,
            overall_accuracy: 0,
          },
          by_category: [],
          recent_activity: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setLoading]);

  const handleStartTest = (category: string, questionSet: string) => {
    navigate("/test", {
      state: {
        category,
        questionSet,
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
