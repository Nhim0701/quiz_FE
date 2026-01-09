import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function UserInfo() {
  const { user } = useAuth();
  const { t } = useTranslation();

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

  return (
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
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
                  {user.fullName}
                </h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("profile.basicInfo.id")}: #{user.userId}
              </p>
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
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.basicInfo.phone")}:
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                      {user.phone}
                    </span>
                  </div>
                </div>
              )}
              {user.birthday && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.basicInfo.birthday")}:
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                      {user.birthday}
                    </span>
                  </div>
                </div>
              )}
              {user.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.basicInfo.address")}:
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 ml-2 block">
                      {user.address}
                    </span>
                  </div>
                </div>
              )}
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
            {user.jobTitle && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t("profile.professional.jobTitle")}:
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                    {user.jobTitle}
                  </span>
                </div>
              </div>
            )}

            {user.company && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t("profile.professional.company")}:
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                    {user.company}
                  </span>
                </div>
              </div>
            )}

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
  );
}
