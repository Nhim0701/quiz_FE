import { useEffect, useState } from "react";
import { Edit, Lock } from "lucide-react";
import useApp from "@/hooks/useApp";
import { useMe } from "@/hooks/useMe";
import { useTranslation } from "@/i18n";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { UserInfo } from "./components";
import { ChangePasswordModal } from "./components/change-password-modal";

export default function Profile() {
  const { setLoading, showError } = useApp();
  const { t } = useTranslation();
  const { getDashboard } = useMe();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await getDashboard();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("errors.fetchDashboardFailed");
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Container>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader title={t("sidebar.profile")} />
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? "default" : "outline"}
            className="gap-2 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 hover:from-purple-700 hover:to-indigo-700 dark:hover:from-purple-600 dark:hover:to-indigo-600 text-white border-0 data-[variant=outline]:bg-transparent data-[variant=outline]:text-current data-[variant=outline]:border"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isEditMode
                ? t("profile.buttons.cancelEdit")
                : t("profile.buttons.editInfo")}
            </span>
            <span className="sm:hidden">
              {isEditMode ? t("profile.buttons.cancel") : t("common.edit")}
            </span>
          </Button>
          <Button
            onClick={() => setIsPasswordModalOpen(true)}
            variant="outline"
            className="gap-2 shadow-sm hover:shadow-md transition-all duration-200 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-300 dark:hover:border-purple-700"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">
              {t("profile.buttons.changePassword")}
            </span>
            <span className="sm:hidden">{t("common.passwordLabel")}</span>
          </Button>
        </div>
      </div>
      <UserInfo isEditMode={isEditMode} onEditModeChange={setIsEditMode} />
      <ChangePasswordModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
      />
    </Container>
  );
}
