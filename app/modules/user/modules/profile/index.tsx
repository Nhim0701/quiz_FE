import { useState } from "react";
import { Edit, Lock } from "lucide-react";
import type { Route } from "./+types/index";
import { useBreadcrumb, usePageData, useApp } from "@/hooks";
import { PageHeader } from "@/components/common/page-header";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { UserInfo, ProfileSkeleton } from "./components";
import { ChangePasswordModal } from "./components/change-password-modal";
import { useProfile } from "./hooks";
import { ROUTES } from "./constants";
import { t } from "@/i18n";
import { pageMeta } from "@/lib";

export const meta: Route.MetaFunction = () => {
  return pageMeta(t("sidebar.profile"))();
};

export default function Profile() {
  const { t, setLoading, getCurrentUser, user } = useProfile();
  const { loading } = useApp();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useBreadcrumb(
    [
      {
        label: t("sidebar.profile"),
        href: ROUTES.INDEX,
      },
    ],
    [t]
  );

  usePageData(() => getCurrentUser(setLoading), {
    errorKey: "errors.fetchUserFailed",
    showLoading: false,
  });

  const isLoading = loading || !user;

  return (
    <Container>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader title={t("sidebar.profile")} />
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? "default" : "outline"}
            className="gap-2 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 hover:from-purple-700 hover:to-indigo-700 dark:hover:from-purple-600 dark:hover:to-indigo-600 text-white border-0 data-[variant=outline]:bg-transparent data-[variant=outline]:text-current data-[variant=outline]:border"
            disabled={isLoading}
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
            disabled={isLoading}
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">
              {t("profile.buttons.changePassword")}
            </span>
            <span className="sm:hidden">{t("common.passwordLabel")}</span>
          </Button>
        </div>
      </div>
      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <UserInfo isEditMode={isEditMode} onEditModeChange={setIsEditMode} />
      )}
      <ChangePasswordModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
      />
    </Container>
  );
}
