import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FormField, DatePickerField } from "@/components/common/form-field";
import { useProfile } from "../hooks";
import { updateUserSchema, type UpdateUserFormData } from "../schemas";

interface UserInfoProps {
  isEditMode?: boolean;
  onEditModeChange?: (isEdit: boolean) => void;
}

export function UserInfo({
  isEditMode = false,
  onEditModeChange,
}: UserInfoProps) {
  const { user, t, handleUpdateUserInfo } = useProfile();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register: registerUpdate,
    control: controlUpdate,
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

  // Reset form with current user values when entering edit mode
  useEffect(() => {
    if (isEditMode && user) {
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
  }, [isEditMode, user, resetUpdate]);

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
      await handleUpdateUserInfo(data, setIsUpdating);
      resetUpdate();
      onEditModeChange?.(false);
    } catch (error) {
      // Error is already handled in handleUpdateUserInfo
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
                    <FormField
                      id="edit-fullName"
                      label={t("profile.edit.fullName")}
                      register={registerUpdate("fullName")}
                      error={updateErrors.fullName}
                      disabled={isUpdating}
                    />
                    <FormField
                      id="edit-userId"
                      label={t("profile.edit.userId")}
                      register={registerUpdate("userId")}
                      error={updateErrors.userId}
                      disabled={isUpdating}
                    />
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
                      <FormField
                        id="edit-phone"
                        label={`${t("profile.basicInfo.phone")}:`}
                        type="tel"
                        register={registerUpdate("phone")}
                        error={updateErrors.phone}
                        disabled={isUpdating}
                      />
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
                      <DatePickerField
                        key={`birthday-${user.birthday || ""}`}
                        id="edit-birthday"
                        label={`${t("profile.basicInfo.birthday")}:`}
                        name="birthday"
                        control={controlUpdate}
                        error={updateErrors.birthday}
                        disabled={isUpdating}
                        placeholder={t("profile.basicInfo.birthday")}
                      />
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
                      <FormField
                        id="edit-address"
                        label={`${t("profile.basicInfo.address")}:`}
                        register={registerUpdate("address")}
                        error={updateErrors.address}
                        disabled={isUpdating}
                      />
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
                    <FormField
                      id="edit-jobTitle"
                      label={`${t("profile.professional.jobTitle")}:`}
                      register={registerUpdate("jobTitle")}
                      error={updateErrors.jobTitle}
                      disabled={isUpdating}
                    />
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
                    <FormField
                      id="edit-company"
                      label={`${t("profile.professional.company")}:`}
                      register={registerUpdate("company")}
                      error={updateErrors.company}
                      disabled={isUpdating}
                    />
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
