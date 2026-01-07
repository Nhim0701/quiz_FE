import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";

interface ProfileHeaderProps {
  userName?: string;
  userEmail?: string;
  onLogout: () => void;
}

export function ProfileHeader({
  userName,
  userEmail,
  onLogout,
}: ProfileHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
          Welcome back, {userName || userEmail}!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
          {userEmail}
        </p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <ThemeToggle className="flex-1 sm:flex-none" />
        <Button
          onClick={onLogout}
          variant="outline"
          className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}

