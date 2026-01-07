import type { ReactNode } from "react";
import { Link } from "react-router";

interface RegisterCardProps {
  children: ReactNode;
}

export function RegisterCard({ children }: RegisterCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700">
      {children}

      {/* Divider */}
      <div className="relative my-5 sm:my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Already have an account?
          </span>
        </div>
      </div>

      {/* Login Link */}
      <Link
        to="/login"
        className="block w-full text-center border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-2.5 sm:py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 text-sm font-semibold"
      >
        Sign In Instead
      </Link>
    </div>
  );
}
