import { User, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function UserInfo() {
  const { user } = useAuth();

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

  const displayName = user.name || user.email || "";
  const initials = user.name
    ? getInitials(user.name)
    : user?.email[0]?.toUpperCase() || "";

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg flex-shrink-0">
          {initials}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <User className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
              {displayName}
            </h2>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-600 dark:text-slate-400">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm sm:text-base truncate">{user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
