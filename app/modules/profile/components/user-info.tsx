import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  CalendarDays,
  Edit,
  Lock,
  Loader2,
} from "lucide-react";
import { useAuth } from "~/modules/common/auth/hooks/useAuth";
import { useTranslation } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useApp from "@/hooks/useApp";
import { updateUserSchema, type UpdateUserFormData } from "../schemas/update-user-schema";

interface UserInfoProps {
  isEditMode?: boolean;
  onEditModeChange?: (isEdit: boolean) => void;
}

export function UserInfo({ isEditMode = false, onEditModeChange }: UserInfoProps) {
  const { user, updateUserInfo } = useAuth();
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: updateErrors },
    reset: resetUpdate,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema(t)),
    defaultValues: {
      userId: user?.userId || "",
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      birthday: user?.birthday || "",
      address: user?.address || "",
      jobTitle: user?.jobTitle || "",
      company: user?.company || "",
    },
  });


  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      resetUpdate({
        userId: user.userId || "",
        fullName: user.fullName || "",
        phone: user.phone || "",
        birthday: user.birthday || "",
        address: user.address || "",
        jobTitle: user.jobTitle || "",
        company: user.company || "",
      });
    }
  }, [user, resetUpdate]);

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user.fullName);

  const onUpdateSubmit = async (data: UpdateUserFormData) => {
    try {
      await updateUserInfo(data, setIsUpdating);
      showSuccess(t("profile.update.success"));
      resetUpdate();
      onEditModeChange?.(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("profile.update.error");
      showError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.basicInfo.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
          {/* User Header */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {isEditMode ? (
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="edit-fullName" className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.edit.fullName")}
                    </Label>
                    <Input
                      id="edit-fullName"
                      {...registerUpdate("fullName")}
                      disabled={isUpdating}
                      className={`mt-1 ${
                        updateErrors.fullName
                          ? "border-red-500 dark:border-red-600"
                          : ""
                      }`}
                    />
                    {updateErrors.fullName && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {updateErrors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="edit-userId" className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.edit.userId")}
                    </Label>
                    <Input
                      id="edit-userId"
                      {...registerUpdate("userId")}
                      disabled={isUpdating}
                      className={`mt-1 ${
                        updateErrors.userId
                          ? "border-red-500 dark:border-red-600"
                          : ""
                      }`}
                    />
                    {updateErrors.userId && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {updateErrors.userId.message}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
                      {user.fullName}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t("profile.basicInfo.id")}: #{user.userId}
                  </p>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("profile.basicInfo.about")}
            </h3>
            <div className="space-y-3">
              {user.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {user.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* User Details Section */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("profile.basicInfo.details")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <div className="flex-1">
                  {isEditMode ? (
                    <>
                      <Label htmlFor="edit-phone" className="text-xs text-slate-500 dark:text-slate-400">
                        {t("profile.basicInfo.phone")}:
                      </Label>
                      <Input
                        id="edit-phone"
                        type="tel"
                        {...registerUpdate("phone")}
                        disabled={isUpdating}
                        className={`mt-1 ${
                          updateErrors.phone
                            ? "border-red-500 dark:border-red-600"
                            : ""
                        }`}
                      />
                      {updateErrors.phone && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {updateErrors.phone.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t("profile.basicInfo.phone")}:
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                        {user.phone || "-"}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <div className="flex-1">
                  {isEditMode ? (
                    <>
                      <Label htmlFor="edit-birthday" className="text-xs text-slate-500 dark:text-slate-400">
                        {t("profile.basicInfo.birthday")}:
                      </Label>
                      <Input
                        id="edit-birthday"
                        type="date"
                        {...registerUpdate("birthday")}
                        disabled={isUpdating}
                        className={`mt-1 ${
                          updateErrors.birthday
                            ? "border-red-500 dark:border-red-600"
                            : ""
                        }`}
                      />
                      {updateErrors.birthday && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {updateErrors.birthday.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t("profile.basicInfo.birthday")}:
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                        {user.birthday || "-"}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  {isEditMode ? (
                    <>
                      <Label htmlFor="edit-address" className="text-xs text-slate-500 dark:text-slate-400">
                        {t("profile.basicInfo.address")}:
                      </Label>
                      <Input
                        id="edit-address"
                        {...registerUpdate("address")}
                        disabled={isUpdating}
                        className={`mt-1 ${
                          updateErrors.address
                            ? "border-red-500 dark:border-red-600"
                            : ""
                        }`}
                      />
                      {updateErrors.address && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {updateErrors.address.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t("profile.basicInfo.address")}:
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400 ml-2 block">
                        {user.address || "-"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Column - Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.professional.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <div className="flex-1">
                {isEditMode ? (
                  <>
                    <Label htmlFor="edit-jobTitle" className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.professional.jobTitle")}:
                    </Label>
                    <Input
                      id="edit-jobTitle"
                      {...registerUpdate("jobTitle")}
                      disabled={isUpdating}
                      className={`mt-1 ${
                        updateErrors.jobTitle
                          ? "border-red-500 dark:border-red-600"
                          : ""
                      }`}
                    />
                    {updateErrors.jobTitle && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {updateErrors.jobTitle.message}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.professional.jobTitle")}:
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                      {user.jobTitle || "-"}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <div className="flex-1">
                {isEditMode ? (
                  <>
                    <Label htmlFor="edit-company" className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.professional.company")}:
                    </Label>
                    <Input
                      id="edit-company"
                      {...registerUpdate("company")}
                      disabled={isUpdating}
                      className={`mt-1 ${
                        updateErrors.company
                          ? "border-red-500 dark:border-red-600"
                          : ""
                      }`}
                    />
                    {updateErrors.company && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {updateErrors.company.message}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.professional.company")}:
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                      {user.company || "-"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {user.joinDate && (
              <div className="flex items-center gap-3">
                <CalendarDays className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t("profile.professional.joinDate")}:
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                    {user.joinDate}
                  </span>
                </div>
              </div>
            )}

            {!user.jobTitle && !user.company && !user.joinDate && (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                {t("profile.professional.noInfo")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Save/Cancel Buttons when in edit mode */}
      {isEditMode && (
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/10">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitUpdate(onUpdateSubmit)}>
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetUpdate();
                    onEditModeChange?.(false);
                  }}
                  disabled={isUpdating}
                  className="min-w-[100px]"
                >
                  {t("profile.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="min-w-[100px] bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 hover:from-purple-700 hover:to-indigo-700 dark:hover:from-purple-600 dark:hover:to-indigo-600 shadow-md hover:shadow-lg"
                >
                  {isUpdating && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {t("profile.buttons.save")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
